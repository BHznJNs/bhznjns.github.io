# 脉宽调制

## 例 1

F_CPU = 16MHz, generate a 50Hz PWM, duty cycle: 45% at PL0

Required Frequency = 50Hz → Timing period = 1 / 50Hz = 20ms
Duty Cycle = 45% → $$T_{on} = 9 ms, T_{off} = 11 ms$$

```cpp
#include <avr/interrupt.h>

volatile unsigned char x = 0;

void timer1_int() {
    OCR1A = 2249; // initialise compare value 1
    TCCR1B |= (1 << WGM12) | (1 << CS11) | (1 << CS10); // CTC mode, prescaler=64;
    TIMSK1 |= (1 << OCIE1A); // enable compare interrupt
    sei(); // enable global interrupt
    PORTL |= (1 << PL0); // set pin HIGH for the first time
}

ISR(TIMER1_COMPA_vect) {
    if (x == 0) {
        PORTL &= ~(1 << PL0); // set pin LOW
        x = 1;
        OCR1A = 2749; // delay 11ms, change compare value
    } else {
        PORTL |= (1 << PL0); // set pin HIGH
        x = 0;
        OCR1A = 2249; // delay 9ms, change compare value
    }
}

int main(void) {
    DDRL |= (1 << PL0);
    timer1_int();
    while (1) {
        // do nothing
    }
}
```

## 例 2：使用 Fast PWM mode

Using Timer0, Fast PWM mode, generate a PWM, duty cycle ##20%## at Pin PB7 (OC0A)
- Top value is 0xFF (255) 
- Required duty cycle = 20%
- OCR0A = 20% of 255 = 51

```cpp
void pwm_init() {
    TCCR0A |= (1<<WGM01) | (1<<WGM00) | (1<<COM0A1); // Fast PWM, non-inverting mode
    TCCR0B |= (1<<CS02) | (1<<CS00);// prescaler=1024
    DDRB |= (1<<PB7); // make OC0A pin (pin 26 ATmega2560) as output pin
    OCR0A = 51; // duty cycle=20%
}
int main(void) {
    pwm_init();
    while (1) {
        //do nothing
    }
}
```