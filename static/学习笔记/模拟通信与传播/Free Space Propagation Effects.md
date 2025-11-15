# Free Space Propagation Effects

## {The Ionosphere}(电离层)

### {Cut-off frequency}(截止频率)

只有当无线电波的频率高于截止频率（$$f_c$$）才能穿过电离层。

### {VLF}(甚低频) Propagation

甚低频指波长约为 20km，对应频率小于等于 15kHz 的电磁波。

在甚低频传播过程中，地球（导电体）和电离层（导电层）之间形成了一个巨大的球形空腔。这个空腔就像一个金属波导管，将 VLF 电波“困”在其中，使它们能够沿着地球的曲面传播，而不是直接射向太空。这使得甚低频可以被用于全球通信。

### Medium frequency propagation

#### Ground Wave

- 沿地球表面传播
- 需要电磁波的极化方向垂直于地面

#### {Tropospheric refraction}(对流层折射)

- 延长地波的通信范围
- 会吸收无线电波的能量，造成信号衰减

#### {Sky wave}(天波)

- 被高空中的电离层反射回地面造成
- 天波的限制：
  - 入射角：天波能否被成功反射，取决于它射向电离层的入射角。如果发射角度太陡（过于垂直），电波会直接穿透电离层而不会被反射。
  - 跳跃距离 (Skip distance)：这是地波传播的终点和第一个天波落点之间的区域。在这个区域内，既收不到地波（太远了），也收不到天波（还没落下来），因此被称为盲区或静区 (dead region)。

### 电离层反射计算

- 临界频率 (Critical frequency, f_crit)
    - 定义：当无线电波被垂直向上（straight up）发射时，能够被电离层反射回来的最高频率。
    - 意义：它代表了当前电离层状态下（特定时间、地点、太阳活动），其“反射能力”的固有上限。任何高于 f_crit 的频率，如果垂直发射，都将直接穿透电离层。
- 最高可用频率 (Maximum usable frequency, MUF)
    - 定义：在特定的一条天波传播路径上（即发射点和接收点固定，入射角φᵢ也固定），能够实现通信的最高频率。
    - 意义：这是进行天波通信时，我们实际可以使用的频率上限。

$$$
MUF = \cfrac{f_{crit}}{cos{\phi i}}
$$$

- $$\phi i$$: 入射角，Angle of incidence

### High frequency propagation

#### Space wave

由于高频波会传过电离层不会被反射，所以必须通过直接波（direct ray）（也叫视距传播 line of sight, LoS）传播

##### 最大通信距离公式

$$$
l = 4.122 (\sqrt{h_1} + \sqrt{h_2}) km
$$$
- $$h_1 \text{ \& } h_2$$: 发送方和接收方的天线高度，单位 m
