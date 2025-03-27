# Port Manipulate | 直接端口操作

为什么是“直接”端口操作，难道还有“间接”端口操作？
当然有，在 Arduino 中，其封装了很多底层的端口操作，如果我们绕开 Arduino 的封装，自己进行操作，那便是“直接”端口操作了。

## Data Direction Register (DDRx)

DDRx 寄存器是用于控制特定端口的数据流向的。
将其中的特定比特设 0，则该引脚为 Input，设 1 则为 Output。
通常来说，对于 LED 灯，设为 Output；而开关、按钮等则设为 Input。

## PINx register & PORTx register

PINx 用于读入数据
PORTx 用于写出数据

## 例程

```c
DDRA  = 0b00000000; // Set port A as input
DDRB  = 0b11111111; // set all pins of port B as outputs 
x     = PINA;       // Read contents of port A
PORTB = 0xFF;       // Write data on port 
```
