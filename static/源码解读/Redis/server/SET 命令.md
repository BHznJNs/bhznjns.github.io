# SET 命令

``SET`` 命令是 Redis 最基础的命令，因此我们从此开始。

SET 命令定义：``src/server.h \-\- setCommand``
实现：``src/t_string.c``

## 用法

SET 命令是用于设置一个键的字符串值，这意味着其参数的 value 部分一定会被作为字符串解析。

SET 命令有 ``O(1)`` 的时间复杂度。

```
SET key value [NX | XX] [GET] [EX seconds | PX milliseconds | EXAT unix-time-seconds | PXAT unix-time-milliseconds | KEEPTTL]
```

## 实现

```c
void setCommand(client *c) {
    robj *expire = NULL;
    int unit = UNIT_SECONDS;
    int flags = OBJ_NO_FLAGS;

    if (parseExtendedStringArgumentsOrReply(c,&flags,&unit,&expire,COMMAND_SET) != C_OK) {
        return;
    }

    c->argv[2] = tryObjectEncoding(c->argv[2]);
    setGenericCommand(c,flags,c->argv[1],c->argv[2],expire,unit,NULL,NULL);
}
```
