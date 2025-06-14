# PID

$$$
u(t) = K_p e(t) + K_i \int_{0}^{t} e(t)dt + K_d \frac{de(t)}{dt}
$$$

$$$
u(t) = K_p \times \text{error} + K_i \times (K_{i\_prior} + \text{error} \times \text{iteration\_time}) + K_d \times \frac{\text{error} - \text{error}_{prior}}{\text{iteration\_time}}
$$$

```c
error_prior=0;
integral=0;
Kp= // Enter PID parameters
Ki=
Kd=
while (1) {
    error=desired_value - actual_value;
    integral=integral+(error*iteration_time);	    
    derivative=(error-error_prior)/iteration_time;
    output=Kp*error + Ki*integral + Kd*derivative + offset;
    error_prior=error;
    // (wait for iteration_time);
}
```
