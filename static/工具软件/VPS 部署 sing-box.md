# VPS 部署 sing-box

> [important] 免责声明
> 本文涉及的所有软件程序及脚本仅用于资源共享和学习研究，不能保证其合法性，准确性，完整性和有效性，请根据情况自行判断。

## 安装 sing-box

直接照着[官网的指引](https://sing-box.sagernet.org/installation/package-manager/)根据自己使用的发行版安装即可。

## 配置服务端 sing-box

使用命令生成密钥对，之后会用到
```bash
sing-box generate reality-keypair
```

修改配置文件``/etc/sing-box/config.json``
```json
{
  "log": {
    "level": "info"
  },
  "dns": {
    "servers": [
      {
        "address": "tls://8.8.8.8"
      }
    ]
  },
  "inbounds": [
    {
      "type": "vless",
      "tag": "vless-in",
      "listen": "::",
      "listen_port": 9981, // 【1. 修改为想要的端口】
      "users": [
        {
          "uuid": "xxx", // 【2. 修改为你的 UUID】
          "flow": ""
        }
      ],
      "tls": {
        "enabled": true,
        "server_name": "www.bing.com", // 这是证书上显示的名字，通常和伪装域名一致
        "reality": {
          "enabled": true,
          "handshake": {
            "server": "www.bing.com", // 【3. 伪装的目标域名】
            "server_port": 443
          },
          "private_key": "UNAmlgoq6A4odg9eXGBAtOXgtyjnzGavZZpL55Xc-F4", // 【4. 粘贴您生成的私钥】
          "short_id": [""]
        }
      }
    }
  ],
  "outbounds": [
    {
      "type": "direct"
    },
    {
      "type": "dns",
      "tag": "dns-out"
    }
  ],
  "route": {
    "rules": [
      {
        "protocol": "dns",
        "outbound": "dns-out"
      }
    ]
  }
}
```

修改 ``systemd`` 服务文件 ``/etc/systemd/system/sing-box.service``（这里可能已经创建好了，记得将其中的可执行文件路径和配置文件路径调成实际的）
```ini
[Unit]
After=network.target nss-lookup.target

[Service]
User=root
WorkingDirectory=/root
CapabilityBoundingSet=CAP_NET_ADMIN CAP_NET_BIND_SERVICE CAP_SYS_PTRACE CAP_DAC_READ_SEARCH
AmbientCapabilities=CAP_NET_ADMIN CAP_NET_BIND_SERVICE CAP_SYS_PTRACE CAP_DAC_READ_SEARCH
ExecStart=/usr/bin/sing-box run -c /etc/sing-box/config.json
ExecReload=/bin/kill -HUP $MAINPID
Restart=on-failure
RestartSec=10
LimitNPROC=512
LimitNOFILE=infinity

[Install]
WantedBy=multi-user.target
```

启动服务并设置开机自启：
```bash
systemctl daemon-reload
systemctl enable sing-box
systemctl start sing-box
```

通过这个命令查看服务运行状态：
```bash
systemctl status sing-box
```

## Clash Meta 配置如下

```yaml
# 基础端口设置，Clash 代理监听的本地端口
port: 7890
socks-port: 7891
allow-lan: false
mode: rule
log-level: info
external-controller: '127.0.0.1:9090'

# DNS 服务器与分流策略
dns:
  enable: true
  ipv6: false
  enhanced-mode: fake-ip
  fake-ip-range: 198.18.0.1/16
  use-hosts: true
  nameserver:
    - https://dns.alidns.com/dns-query
    - https://doh.pub/dns-query
  fallback:
    - https://dns.google/dns-query
    - https://cloudflare-dns.com/dns-query
  nameserver-policy:
    'geosite:cn': nameserver
    'geosite:private': nameserver

# 核心部分：定义您的代理服务器
proxies:
  - name: "VLESS-Reality" # 可以随意起一个你喜欢的名字
    type: vless
    server: YOUR_VPS_IP         # <-- 替换为您的服务器 IP
    port: YOUR_PORT             # <-- 替换为您的端口
    uuid: YOUR_UUID             # <-- 替换为您的 UUID
    network: tcp
    tls: true
    udp: true
    client-fingerprint: chrome  # 客户端指纹
    servername: YOUR_SNI_DOMAIN # <-- 替换为您的伪装域名 (SNI)
    reality-opts:
      public-key: YOUR_REALITY_PUBLIC_KEY # <-- 替换为您的 Reality 公钥
      short-id: ''              # 短 ID，一般留空即可

# 代理组：管理如何使用上面的代理
proxy-groups:
  - name: "Proxy"
    type: select
    proxies:
      - "VLESS-Reality" # 必须和上面 proxies 里的 name 完全一致
      - DIRECT

# 规则：决定哪些流量走代理
rules:
  - GEOIP,LAN,DIRECT
  - GEOIP,CN,DIRECT
  - MATCH,Proxy
```

- - -

## 常见问题

### 下行速率很慢

这是由于 VPS 上默认使用 cubic 算法来进行拥塞控制。你可以通过如下指引使用 bbr 算法来提升下行速率。
>>>如何设置 bbr 拥塞控制算法
#### 第 1 步：检查当前是否已开启 BBR

通过 SSH 连接到您的 VPS，然后运行以下两条命令。

1. 检查当前的拥塞控制算法：
```bash
sysctl net.ipv4.tcp_congestion_control
```
- 如果输出是 `net.ipv4.tcp_congestion_control = bbr`：说明 BBR 已经开启，问题可能在别处（但可能性较小）。
- 如果输出是 `net.ipv4.tcp_congestion_control = cubic`：恭喜您，找到了问题所在！您需要手动开启 BBR。

2. 检查 BBR 模块是否已加载 (可选，但推荐)：
```bash
lsmod | grep bbr
```
- 如果有输出（例如 `tcp_bbr`），说明内核模块已加载。
- 如果没有输出则请按照下面的指引开启 BBR 模块

#### 第 2 步：开启 BBR

1. 编辑 `/etc/sysctl.conf` 文件：
这个文件是系统内核参数的配置文件。
```bash
sudo nano /etc/sysctl.conf
```

2. 在文件末尾添加以下两行：
将这两行内容完整地复制并粘贴到文件的最下方。
```
net.core.default_qdisc = fq
net.ipv4.tcp_congestion_control = bbr
```

3. 保存并退出
4. 让配置立即生效：
运行以下命令来应用您刚刚做的修改。
```bash
sudo sysctl -p
```
执行后，您应该会看到刚才添加的那两行配置被打印出来。

#### 第 3 步：重启服务器（推荐）

虽然 `sysctl -p` 已经让配置生效，但为了确保所有网络相关的内核模块都以最佳状态加载，强烈建议您重启一次 VPS。
```bash
sudo reboot
```
