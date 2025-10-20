# Review: 向量计算

## 梯度（del）

### 计算过程

> 给定一个标量函数 $$f(x, y, z)$$，计算其梯度 $$\nabla f$$。

#### 1. 原始函数

我们有一个三变量的标量函数：
$$$
f(x, y, z) = 2x + 5y + 9z^2
$$$

#### 2. 计算偏导数

梯度是由函数对每个变量的偏导数构成的向量。我们分别计算 $$f$$ 对 $$x, y, z$$ 的偏导数。
$$$
\frac{\partial f}{\partial x} = \frac{\partial}{\partial x}(2x + 5y + 9z^2) = 2
$$$

$$$
\frac{\partial f}{\partial y} = \frac{\partial}{\partial y}(2x + 5y + 9z^2) = 5
$$$

$$$
\frac{\partial f}{\partial z} = \frac{\partial}{\partial z}(2x + 5y + 9z^2) = 18z
$$$

#### 3. 最终梯度

将计算出的三个偏导数合并成一个向量，即为该函数的梯度。
$$$
\nabla f(x, y, z) = \left( \frac{\partial f}{\partial x}, \frac{\partial f}{\partial y}, \frac{\partial f}{\partial z} \right)
$$$
得到最终结果：
$$$
\nabla f(x, y, z) = (2, 5, 18z)
$$$
这个结果是一个矢量场（vector field）。

## 散度（div）

对于一个向量函数 $$F(x, y) = (xy, y²)$$，
计算公式：
$$$
\nabla \cdot F(x, y) = \frac{\partial F_x}{\partial x} + \frac{\partial F_y}{\partial y} = y + 2y = 3y
$$$
