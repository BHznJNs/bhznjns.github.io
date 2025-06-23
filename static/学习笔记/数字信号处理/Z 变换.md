# Z 变换

## 从时域序列求 Z 变换

>>>从一般指数序列求 Z 变换
$$$
x[n] = y^n u[n]
$$$

$$$
X(z) = \cfrac{1}{1 - yz^{-1}}
$$$

- - -

$$$
x[n] = [1 \quad 0.8 \quad 0.8^2 \quad 0.8^3 \quad ...]
$$$

$$$
X(z) = \sum_{n=0}^{\infty} x[n]z^{-n}\\
= 1+0.8z^{-1} + 0.8^2 z^{-2} + 0.8^3 z^{-3} + ...\\
= 1+0.8z^{-1} + (0.8z^{-1})^2 + (0.8z^{-1})^3 + ...\\
= \frac{1}{1-0.8z^{-1}} = \frac{z}{z-0.8}\\
$$$
>>>

## 从 Z 变换求逆 Z 变换

$$$
X(z) = \frac{1}{z+1.2}
$$$

$$$
X(z) = \frac{1}{z+1.2} = \frac{z^{-1}}{1+1.2z^{-1}} = z^{-1}\frac{1}{1-(-1.2z^{-1})}\\
= z^{-1}\{1+(-1.2z^{-1})+(-1.2z^{-1})^2+(-1.2z^{-1})^3+...\}\\
= z^{-1}-1.2z^{-2}+1.44z^{-3}-1.728z^{-4}+...\\
$$$

Therefore, the signal $$x[n]: 0 \quad 1 \quad -1.2 \quad 1.44 \quad -1.728 \quad ...$$

>>>一些其它的例子
### 通过 partial fractions 求逆 Z 变换

A signal has the z-transform $$X(z) = \frac{1}{z(z-1)(2z-1)}$$, find the corresponding original signal.

$$$
X(z) = \frac{1}{z(z-1)(2z-1)} = \frac{A}{z} + \frac{B}{z-1} + \frac{C}{2z-1}
$$$

### 通过 Z 变换计算频率响应

对于差分方程 $$y[n] = −0.8y[n −1]+ x[n]$$，找到频率响应 H(Ω)，绘制 ∣H(Ω)∣ 的草图，确定 ∣H(Ω)∣ 在 Ω=0 和 Ω=π 处的值，指出滤波器的类型。

先对差分方程进行 Z 变换：
$$$
Y(z) = -0.8z^{-1}Y(z) + X(z)\\
H(z) = \frac{1}{1+0.8z^{-1}} = \frac{z}{z+0.8}\\
$$$

变换后进行频率响应的推导和计算：
$$$
H(\Omega) = \frac{e^{j\Omega}}{e^{j\Omega}+0.8} = \frac{\cos\Omega + j\sin\Omega}{0.8+\cos\Omega + j\sin\Omega}\\
|H(\Omega)| = \frac{1}{\sqrt{(0.8 + \cos\Omega)^2 + (\sin\Omega)^2}} = \frac{1}{\sqrt{1.64 + 1.6\cos\Omega}}\\
$$$

再对特殊点的幅频响应值进行计算：
$$$
|H(0)| = \frac{1}{\sqrt{1.64 + 1.6\cos\Omega}} = \frac{1}{\sqrt{1.64+1.6}} = 0.56\\
|H(\pi)| = \frac{1}{\sqrt{1.64 + 1.6\cos\Omega}} = \frac{1}{\sqrt{1.64-1.6}} = 5\\
$$$

可知为高通滤波器。

>>>

## Z 平面

First-order $$H_1(z) = \frac{z-z_1}{z-p_1}$$
Second-order $$H_2(z) = \frac{(z-z_2)(z-z_3)}{(z-p_2)(z-p_3)}$$
Higher-order $$H(z) = \frac{(z-z_1)(z-z_2)(z-z_3)(z-z_4)...}{(z-p_1)(z-p_2)(z-p_3)(z-p_4)...}$$

转换为 Frequency response：
- 使用 $$H(\Omega)$$ 替换 $$H(z)$$
- 使用 $$exp(j\Omega)$$ 替换 z
- 使用 $$exp(j2\Omega)$$ 替换 z''2''

>>>例题 1
A digital filter has 2 poles at $$z = 0.98\angle\pm\pi/3$$, and 2 zeros at $$z = 1.00\angle\pm\pi/2$$ in the $$z$$-plane. The sampling frequency is $$1 kHz$$.

### Questions

1. Derive the transfer function $H(z)$ of the filter.
2. Sketch the amplitude of the frequency response of filter over one period, labelling any frequency of special significance, and find the ratio of the maximum gain of the filter to the gain at frequency 0.
3. Derive the difference equation for the filter.
4. Draw a block diagram representing the filter, labelling all filter coefficients.

### Solution

#### Derive the transfer function $H(z)$ of the filter.

Given poles: $$p_1 = 0.98e^{j\pi/3}$$ and $$p_2 = 0.98e^{-j\pi/3}$$
The denominator of H(z) is:
$$$
(z - p_1)(z - p_2) = (z - 0.98e^{j\pi/3})(z - 0.98e^{-j\pi/3})\\
= z^2 - 0.98(e^{j\pi/3} + e^{-j\pi/3})z + (0.98)^2\\
= z^2 - 0.98(2\cos(\pi/3))z + 0.9604\\
= z^2 - 0.98(2 \cdot 0.5)z + 0.9604\\
= z^2 - 0.98z + 0.9604\\
$$$


Given zeros: $$z_1 = 1.00e^{j\pi/2}$$ and $$z_2 = 1.00e^{-j\pi/2}$$
The numerator of H(z) is:
$$$
(z - z_1)(z - z_2) = (z - e^{j\pi/2})(z - e^{-j\pi/2})\\
= z^2 - (e^{j\pi/2} + e^{-j\pi/2})z + 1\\
= z^2 - (2\cos(\pi/2))z + 1\\
= z^2 - 0z + 1 = z^2 + 1\\
$$$

Therefore, the transfer function is:
$$$
H(z) = \frac{z^2 + 1}{z^2 - 0.98z + 0.9604}
$$$

#### Sketch the amplitude of the frequency response of filter over one period, labelling any frequency of special significance, and find the ratio of the maximum gain of the filter to the gain at frequency 0

The frequency response is obtained by substituting $$z = e^{j\Omega}$$ into H(z):
$$$
H(\Omega) = \frac{e^{j2\Omega}+1}{e^{j2\Omega}-0.98e^{j\Omega}+0.9604}
$$$

将特殊值代入，得到表格：

| Ω | 0 |  π/3 | π/2 | π |
| $$\vert H(\Omega) \vert$$ | 2.04 | 29.2 | 0 | 0.68 |

#### Derive the difference equation for the filter

将传递函数上下同除以 z''2''
$$$
H(z) = \frac{z^2 + 1}{z^2 - 0.98z + 0.9604} = \frac{1+z^{-2}}{1-0.98z^{-1} + 0.9604z^{-2}} = \frac{Y(z)}{X(z)}
$$$
$$$
(1-0.98z^{-1} + 0.9604z^{-2})Y(z) = (1+z^{-2})X(z)
$$$

转换成差分方程：
$$$
y[n] = 0.98y[n-1] - 0.9604y[n-2] + x[n] + x[n-2]
$$$
>>>
