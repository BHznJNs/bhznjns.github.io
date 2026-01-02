# The Dipole Antenna and the Reflector Antenna

## Basic radiation equation

$$$
\dot{I} L = Q \dot{v}\ Ams^{-1}
$$$

- İ 是时变电流 (time-varying current)
- L 是承载电流的导体长度
- Q 是电荷
- v̇ 是电荷的加速度 (rate of change of velocity)

## {Radiation Resistance}(辐射电阻)

- 从发射机（比如一个信号源）的角度看，它并不知道自己连接的是一个复杂的天线。当发射机把能量通过传输线推给天线时，天线并没有把能量以热量的形式消耗掉，而是把它辐射到空间中了。
- 对于发射机来说，这种能量的“永久损失”，其效果和一个电阻消耗能量的效果是一样的。
- 因此，我们定义了一个等效的电阻，称为辐射电阻 (Radiation Resistance)。它不是一个会发热的物理电阻，而是一个虚拟的电阻，用来衡量天线将电路功率转换为电磁波辐射功率的能力。

意义：辐射电阻是天线的一个非常重要的参数。一个高效的天线，其辐射电阻应该远大于它自身的欧姆电阻（即导线发热造成的损耗）。这样，绝大部分输入能量都会被辐射出去，而不是变成热量浪费掉。

## Radiation Efficiency

$$$
\xi = \cfrac{P_{rad}}{P_{total}} = \cfrac{P_{rad}}{P_{rad} + P_{loss}} = \cfrac{R_{rad}}{R_{rad} + R_{loss}} \%
$$$

- $$P_{rad}$$: 辐射功率 (Radiated Power)
- $$P_{total}$$: 总输入功率 (Total Input Power)
- $$P_{loss}$$: 损耗功率 (Loss Power)
- $$R_{rad}$$: 辐射电阻 (Radiation Resistance)
- $$R_{loss}$$: 损耗电阻 (Loss Resistance)

## {The short thin dipole}(短薄偶极子) (Hertzian antenna)

定义：l << λ 当天线的长度 l 相对于信号波长 λ 来说可以忽略不计时，这个天线就是短薄偶极子。例如，对于一个 1 米波长的信号，一根 1 厘米长的天线就可以被看作是短偶极子。

## Antenna {directivity}(方向性系数)

$$$
D = \cfrac{最大辐射强度}{平均辐射强度} = \cfrac{(dP / d\Omega)_{\max}}{P / 4\pi}
$$$

简化后的计算公式：$$D = \frac{4\pi}{\Omega_A}$$

- For ##isotropic antenna##, $$\Omega_A = 4\pi$$, hence $$D = 1$$
- For directed beam, $$\Omega_A < 4\pi$$, hence $$D > 1$$
- For a Hertzian dipole, $$D = 1.5$$
- For a half-wave dipole, $$D = 1.64$$ OR $$(10\log_{10}{1.64} = 2.1 \text{ dB})$$
- For $$D \gg 1$$, need antenna size $$\gg \lambda$$, usually an array or a large aperture (dish)

{For a lossless antenna, Gain = Directivity}(对于无损耗的天线，天线增益在数值上等于方向性系数)
