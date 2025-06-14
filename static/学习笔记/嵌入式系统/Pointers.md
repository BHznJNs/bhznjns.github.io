# Memory & Pointers

## Memory

Types of memory: __Non-Volatile Memory__ and __Volatile Memory__

## Pointers

- ``&`` gives the address of a variable
- ``*`` gives the value stored in the variable pointed to by a pointer 

### 例子 1

```c
char *x, y;
void foo(void) {
  x = 0x20;
  y = *x;
}
```

### 例子 2

```c
char foo() {
  char *x, y;
  x = 0x20;
  y = *x;
  return y;
}

char z;
int main(void) {
  z = foo();
}
```

### 例子 3

```c
char foo() {
  char y;
  uint16_t *x;
  x = 0x20;
  y = *x;
  return y;
}

char z;
int main(void) {
  z = foo();
}
```

z is loaded with the 8-bit value in the I/O register at location 0x20

