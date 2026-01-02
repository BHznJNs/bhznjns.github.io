# Transmission and Propagation in Free Space

## 功率密度公式

$$$
W = \cfrac{P_t}{4 \pi R^2} W/m^2
$$$

- $$P_t$$: 传输的总能量
- $$4 \pi R^2$$: 球面表面积

## dB Scale in Communication Engineering

### 将线性功率转换为 dB 形式

$$$
X_{dB} = 10 * log_{10} \cfrac{X}{X_{ref}}
$$$
- In case of transmit or received power: $$X_{ref}=1W$$ for dB  or $$X_{ref} = 1mW$$ for dBm
- In case of antenna gain: $$X_{ref}=1$$

>>>计算示例

给定一个 5G 发射器，功率 $$P = 4W$$
a) 求换算成 dB 的传输功率

参考功率 $$P_{ref} = 1 W$$
$$$
P_{dB} = 10 \log_{10}\left(\frac{P}{1W}\right) = 10 \log_{10}(\frac{4}{1W}) = 10 \log_{10}(4)\\
P_{dB} = 6.02 \text{dB}
$$$

b) 求换算成 dBm 的传输功率

参考功率 $$P_{ref} = 1 mW$$
$$$
P_{\text{dBm}} = 10\log_{10}(\frac{P}{1\text{mW}}) = 10\log_{10}(\frac{4}{0.001}) = 10\log_{10}(4000) \\
P_{\text{dBm}} = 36.02 \text{dBm}
$$$
>>>

### 将 dB 形式转换为线性功率

$$$
P = 10^\frac{P_{dB}}{10} W\\
P = 10^\frac{P_{dBm}}{10} mW
$$$

对于天线增益：
$$$
G = 10^\frac{G_{dB}}{10}
$$$

## 天线增益

$$$
G_t = \cfrac{W_t}{W}
$$$

- $$W_t$$: actual power density at distance R from source
- $$W$$: power density from isotropic source at distance R from source

$$$
W_t = \cfrac{P_t G_t}{4 \pi R^2} W/m^2
$$$

## Equivalent Isotropic Radiated Power (EIRP)

$$$
EIRP (dB) = P_t (dB) + G_t (dB) - F_e (dB)
$$$

- $$P_t$$: 发射器功率
- $$G_t$$: 天线增益
- $$F_e$$: 馈线损耗

## Antenna as receiver

$$$
P_r = W_t A_{eff}
$$$
- $$P_r$$: 接收的功率
- $$W_t$$: 传输的功率密度

Aperture Efficiency:
$$$
\eta = \frac{A_{eff}}{A} \times 100\%
$$$

### {Antenna Reciprocity}(天线互易性)

一个天线在发射时“聚焦”能量的能力 (G)，和它在接收时“收集”能量的能力 (A_eff)，是完全成正比的。

$$$
G = \cfrac{4 \pi k A}{\lambda^2}
$$$

- $$A$$: actual physical area of antenna
- $$k$$: a efficiency multiplier (<1, related to $$\eta$$) such that $$kA = A_{eff}$$
- $$\lambda$$: wavelength of radiation

### Friis transmission equation

$$$
P_r = P_t G_t G_r (\cfrac{\lambda}{4\pi R})^2
$$$
- $$P_r​$$: 接收功率 (Received Power)
- $$P_t​$$: 发射功率 (Transmitted Power)
- $$G_t​$$: 发射天线增益 (Transmitting Antenna Gain)
- $$G_r​$$: 接收天线增益 (Receiving Antenna Gain)
- $$λ$$: 波长 (Wavelength)
- $$R$$: 发射机和接收机之间的距离 (Distance)

#### Path loss

$$$
L_p = 20 \log(\cfrac{\lambda}{4\pi R}) dB
$$$

#### dB form of Friis transmission equation

$$$
P_r (\text{dBW}) = P_t (\text{dBW}) + G_t (\text{dB}) + G_r (\text{dB}) + L_p (\text{dB})
$$$
