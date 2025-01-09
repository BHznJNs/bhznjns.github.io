# Op-Amp Filters

Cut-off frequency: $$f_c = \cfrac{1}{2 \pi R C}$$

## Low Pass Filter

![Low pass filter circuit](.Op-Amp Filters/Low Pass Filter.png)
![Low pass filter extra circuit](.Op-Amp Filters/Low Pass Filter extra.png)
$$$
R_f = R_2 \parallel C = \frac{R_2}{1 + j \omega C R_2}\\
A_v(\omega) \approx -\cfrac{R_2}{R_1}
$$$

## High Pass Filter

![High pass filter circuit](.Op-Amp Filters/High Pass Filter.png)
![High pass filter circuit extra](.Op-Amp Filters/High Pass Filter extra.png)
$$$
R = R_1 + \cfrac{1}{j \omega C}\\
A_v(\omega) \approx -\cfrac{R_f}{R_1}
$$$

