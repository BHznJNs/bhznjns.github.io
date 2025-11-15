# Noise and interference

## Thermal Noise / Johnson Nyquist Noies

噪声的一个极其重要的特性是，它的功率谱密度在非常宽的频率范围内都是均匀分布的，几乎不随频率变化，即白噪声。

### 计算公式

$$$
V_n = \sqrt{4 * k_B * T * R * B}\ \text{Volts}
$$$

其中：
- $$kB = 1.38 \times 10^{-23}$$
- T：绝对温度（开尔文，K）
- R：电阻值（欧姆，Ω）
- B：带宽（赫兹，Hz）

噪声谱密度：为了方便比较，通常会用单位带宽（1Hz）下的噪声电压来衡量，单位是 V/√Hz。

$$$
V_n = \sqrt{4k_{B}TR}\ \ \mathrm{V}/\sqrt{\mathrm{Hz}}
$$$

### 热噪声功率

计算公式：
$$$
P_n = k_B T B
$$$

## {Noise Factor}(噪声系数)

$$$
F = \cfrac{\text{available S/N power ratio at input}}{\text{available S/N power ratio at output}} = \cfrac{S_{in}(GN_{in} + N_c)}{N_{in}GS_{in}} = 1 + \cfrac{N_c}{GN_{in}}\\

F = SNR_{in} / SNR_{out}
$$$

- 输入端：
    - $$S_{in}$$：输入的有用信号功率。
    - $$N_{in}$$：输入端自带的噪声功率。在标准定义下，这通常就是来自信号源电阻的热噪声，N_in = k * T₀ * B，其中 T₀ 是标准温度 290K。
- 电路模块：
    - $$G$$：电路的功率增益。它会同时放大输入的信号和噪声。
    - $$N_c$$：电路自身产生的、额外的内部噪声功率。这是关键！任何真实的元器件（晶体管、电阻等）都会产生噪声。
- 输出端：
    - $$S_{out}$$：输出的有用信号功率。它就是被放大了 G 倍的输入信号，S_out = G * S_in。
    - $$N_{out}$$：输出端的总噪声功率。它由两部分组成：
        - 被放大了 G 倍的输入噪声 (G * N_in)。
        - 电路自身产生的内部噪声 (N_c)。
        - 所以，$$N_{out} = G * N_{in} + N_c$$。

输入信噪比：
$$$
SNR_{in} = S_{in} / N_{in}
$$$

输出信噪比：
$$$
SNR_{out} = S_{out} / N_{out} = (G * S_{in}) / (G * N_{in} + N_c)
$$$

### {Noise Figure}(噪声指数)

噪声指数（Noise Figure, NF）就是噪声系数（Noise Factor, F）的分贝（dB）表示形式。

$$$
Noise Figure (dB) = 10 * log10(Noise Factor)
$$$

$$$
F(dB) = SNR_{in}(dB) - SNR_{out}(dB)
$$$

注：信噪比（SNR）在 dB 域的计算，就是信号功率（dBm）减去噪声功率（dBm），即：$$SNR(dB) = S(dBm) - N(dBm)$$

一个器件的噪声指数（NF），在数值上就等于信号通过它之后，信噪比（SNR）下降了多少分贝（dB）。

## Noise in cascaded circuits

当多个电路模块（如放大器）串联在一起时，整个系统的总噪声性能不等于各个模块噪声性能的简单相加。##第一级电路的性能对总体性能起着决定性的作用。##

### 弗林斯（Friis）级联噪声公式

$$$
F = F_1 + \cfrac{F_2 - 1}{G_1}
$$$
- F: 整个两级级联系统的总噪声系数。
- F₁: 第一级的噪声系数。
- F₂: 第二级的噪声系数。
- G₁: 第一级的功率增益。

## {Noise Temperature}(噪声温度)

由公式 $$P_n = k_B * T_n * B$$，反过来将任何一个源（无论它是不是热噪声）产生的噪声功率 P_n，等效地看作是一个理想无噪声电阻在某个特定温度 T_n 下产生的热噪声。
这个等效的温度 T_n 就被称为噪声温度。

由噪声系数计算噪声温度：
$$$
T_n = (F - 1) * T_0
$$$
- $$T_0$$: 标准温度 290 K

对于串联电路，其噪声温度计算公式如下：
$$$
T_n = T_1 + \cfrac{T_2}{G_1} + \cfrac{T_3}{G_1 G_2} + \dots
$$$

## {Error Rate}(误码率)

错误概率 P(e) 是一个理论值，表示一个比特在传输中出错的数学概率。
例如，P(e) = 10⁻⁵ 意味着平均每传输 100,000 个比特，才会出现 1 个错误。

误码率计算公式：
$$$
P(e) = \cfrac{1}{2}\text{erfc}(\cfrac{1}{2}\sqrt{\cfrac{S}{N}})
$$$
