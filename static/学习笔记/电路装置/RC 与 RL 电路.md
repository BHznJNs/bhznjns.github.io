# RC 与 RL 电路

## 电容放电公式

电容放电电压随时间变化公式：

$$$
v_c(t) = Ve^{-\frac{t}{RC}},\\
where\ the\ initial\ voltage\ v_c(0) = V\\
$$$

在这里的时间常数 $$\tau$$：

$$$
\tau = RC
$$$

## 电容在 RC 电路中的充电公式

电容充电电压随时间变化公式：

$$$
v_c(t) = V(1 - e^{-\frac{t}{\tau}})
$$$

- - -

## 电感放电公式

电容放电电流随时间变化公式：

$$$
i_L(t) = \frac{V}{R_1} e^{-\frac{R}{L} t},\\
where\ the\ initial\ current\ i_L(0) = \frac{V}{R_1}\\
$$$

在这里的时间常数 $$\tau$$：

$$$
\tau = \frac{L}{R}
$$$

## 电感在 RL 电路中的充电公式

电感充电电压随时间变化公式：

$$$
i_L(t) = \frac V R (1 - e^{-\frac{t}{\tau}})
$$$
