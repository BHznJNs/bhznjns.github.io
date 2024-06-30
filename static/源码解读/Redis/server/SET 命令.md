# SET 命令

``SET`` 命令是 Redis 最基础的命令，因此我们从此开始。

SET 命令
- 定义：``src/server.h \-\- setCommand``
- 实现：``src/t_string.c``

## 用法

SET 命令是用于设置一个键的字符串值，这意味着其参数的 value 部分一定会被作为字符串解析。

SET 命令有 ``O(1)`` 的时间复杂度。

```
SET key value [NX | XX] [GET] [EX seconds | PX milliseconds | EXAT unix-time-seconds | PXAT unix-time-milliseconds | KEEPTTL]
```

## 实现

### SET 命令入口

```c
// src/t_string.c
void setCommand(client *c) {
    robj *expire = NULL;
    int unit = UNIT_SECONDS; // 默认单位为秒
    int flags = OBJ_NO_FLAGS;

    // 校验命令参数，并根据参数更改更改 expire, unit, flags 的值
    if (parseExtendedStringArgumentsOrReply(c,&flags,&unit,&expire,COMMAND_SET) != C_OK) {
        // 若参数不符合格式要求，直接返回
        return;
    }

    // 当进行 SET 操作时， argv[2] 即为 value，
    // 此处对 value 进行字符串的编码处理。
    c->argv[2] = tryObjectEncoding(c->argv[2]);
    // SET 操作的内部实现
    setGenericCommand(c,flags,c->argv[1],c->argv[2],expire,unit,NULL,NULL);
}
```

### 内部实现

```c
// src/t_string.c
void setGenericCommand(client *c, int flags, robj *key, robj *val, robj *expire, int unit, robj *ok_reply, robj *abort_reply) {
    long long milliseconds = 0; /* initialized to avoid any harmness warning */
    int found = 0;
    int setkey_flags = 0;

    if (expire && getExpireMillisecondsOrReply(c, expire, flags, unit, &milliseconds) != C_OK) {
        return;
    }

    if (flags & OBJ_SET_GET) {
        if (getGenericCommand(c) == C_ERR) return;
    }

    found = (lookupKeyWrite(c->db,key) != NULL);

    if ((flags & OBJ_SET_NX && found) ||
        (flags & OBJ_SET_XX && !found))
    {
        if (!(flags & OBJ_SET_GET)) {
            addReply(c, abort_reply ? abort_reply : shared.null[c->resp]);
        }
        return;
    }

    /* When expire is not NULL, we avoid deleting the TTL so it can be updated later instead of being deleted and then created again. */
    setkey_flags |= ((flags & OBJ_KEEPTTL) || expire) ? SETKEY_KEEPTTL : 0;
    setkey_flags |= found ? SETKEY_ALREADY_EXIST : SETKEY_DOESNT_EXIST;

    // 实际进行键值对添加或修改的函数
    setKey(c,c->db,key,val,setkey_flags);

    server.dirty++;
    notifyKeyspaceEvent(NOTIFY_STRING,"set",key,c->db->id);

    if (expire) {
        setExpire(c,c->db,key,milliseconds);
        /* Propagate as SET Key Value PXAT millisecond-timestamp if there is
         * EX/PX/EXAT flag. */
        if (!(flags & OBJ_PXAT)) {
            robj *milliseconds_obj = createStringObjectFromLongLong(milliseconds);
            rewriteClientCommandVector(c, 5, shared.set, key, val, shared.pxat, milliseconds_obj);
            decrRefCount(milliseconds_obj);
        }
        notifyKeyspaceEvent(NOTIFY_GENERIC,"expire",key,c->db->id);
    }

    if (!(flags & OBJ_SET_GET)) {
        addReply(c, ok_reply ? ok_reply : shared.ok);
    }

    /* Propagate without the GET argument (Isn't needed if we had expire since in that case we completely re-written the command argv) */
    if ((flags & OBJ_SET_GET) && !expire) {
        int argc = 0;
        int j;
        robj **argv = zmalloc((c->argc-1)*sizeof(robj*));
        for (j=0; j < c->argc; j++) {
            char *a = c->argv[j]->ptr;
            /* Skip GET which may be repeated multiple times. */
            if (j >= 3 &&
                (a[0] == 'g' || a[0] == 'G') &&
                (a[1] == 'e' || a[1] == 'E') &&
                (a[2] == 't' || a[2] == 'T') && a[3] == '\0')
                continue;
            argv[argc++] = c->argv[j];
            incrRefCount(c->argv[j]);
        }
        replaceClientCommandVector(c, argc, argv);
    }
}
```

这个函数有点长，不过我们可以先集中于其中的 ``setKey`` 函数。

```c
src/db.c
void setKey(client *c, redisDb *db, robj *key, robj *val, int flags) {
    int keyfound = 0;

    if (flags & SETKEY_ALREADY_EXIST)
        keyfound = 1;
    else if (flags & SETKEY_ADD_OR_UPDATE)
        keyfound = -1;
    else if (!(flags & SETKEY_DOESNT_EXIST))
        keyfound = (lookupKeyWrite(db,key) != NULL);

    // 根据输入的 flags 值的不同对 db 进行不同的操作
    if (!keyfound) {
        // 如果 key 不存在，同
        // dbAddInternal(db,key,val,1);
        // 即在不考虑 key 存在的情况下调用 ``dbAddInternal``
        dbAdd(db,key,val);
    } else if (keyfound<0) {
        // 如果 key 存在，调用 ``dbSetValue`` 更新 key 对应的值
        dbAddInternal(db,key,val,1);
    } else {
        // 其它情况，直接设置值
        dbSetValue(db,key,val,1,NULL);
    }
    incrRefCount(val);
    if (!(flags & SETKEY_KEEPTTL)) removeExpire(db,key);
    if (!(flags & SETKEY_NO_SIGNAL)) signalModifiedKey(c,db,key);
}
```

