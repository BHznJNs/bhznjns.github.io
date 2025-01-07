# BJT DC Analysis

## I,,C,, versus V,,CE,,

图像从左到右分别为：Saturation, Active, Breakdown

绘制{负载线}(load line)：
- 在 I,,C,, 轴上找到点 $$\cfrac{V_{CC}}{R_C}$$
- 在 V,,CE,, 轴上找到点 $$V_{CC}$$
- 将两点相连

负载线与图像的交点即晶体管的{静态工作点}(Quiescent Point)。

## 四种 DC Biasing Configuration

### Base Biasing

![Base biasing 电路图](.BJT/Base biasing.png)

使用一个电阻 R,,B,, 连接在基极和电源 V,,CC,, 之间，基极电流由 R,,B,, 控制。

$$$
V_{BB} = I_B R_B + V_{BE}, V_{BE} = 0.7V\\
I_B = \cfrac{V_{BB} - 0.7V}{R_B}\\
I_C = \beta I_B \approx I_E\\

V_{CC} = I_C R_C + V_{CE}\\
V_{CE} = V_{CC} - I_C R_C\\
$$$

### Collect Feedback Biasing

![Collect feedback biasing 电路图](.BJT/Collect feedback biasing.png)
![Collect feedback biasing 电路图](.BJT/Collect feedback biasing extra.png)

集电极通过一个反馈电阻 R,,C,,​ 连接到基极

$$$
V_{CC} = I_B R_B + V_{BE} = I_B R_B + 0.7V\\
I_C = \beta I_B = \beta \frac{V_{CC} - 0.7 \, \text{V}}{R_B} \approx I_E\\
V_{CC} = I_C R_C + V_{CE}\\
$$$

### Emitter Biasing

![Emitter biasing 电路图](.BJT/Emitter biasing.png)

在发射极引入一个电阻 R,,E,, 和额外的电压降​，利用负反馈稳定工作点。

### Voltage Divider Biasing

![Voltage divider biasing 电路图](.BJT/Voltage divider biasing.png)

基极通过分压电阻网络 R,,1,,​ 和 R,,2,,​ 偏置，提供稳定的基极电压。

# BJT AC Analysis

![BJT AC 等效电路](.BJT/BJT AC Equivalent.png)

1. 使用等效电路代替电路中的 BJT
2. 将 DC 源看作接地
3. 将 电容看作导线

## {共发射极放大器}(Common-emitter Amplifier)

![共发射极放大器图例](.BJT/Common-emitter amplifier.png)

>>>计算发射极电阻 r,,e,,
计算基极电压 V,,B,,
$$$
V_B = \cfrac{R_2}{R_1 + R_2} V_{CC}
$$$

计算发射极电流 I,,E,,
$$$
I_E = \cfrac{V_E}{R_E} = \cfrac{V_B - 0.7}{R_E}
$$$

发射极电阻 r,,e,,
$$$
r_e = \cfrac{V_T}{I_E} = \cfrac{25 mV}{I_E}
$$$
>>>
