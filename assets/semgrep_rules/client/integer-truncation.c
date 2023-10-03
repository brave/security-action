// Marco Ivaldi <raptor@0xdeadbeef.info>

#include <stdio.h>

int assign_int(int int_var)
{
	// ruleid: integer-truncation
	char char_var = int_var;
	short short_var;

	// ruleid: integer-truncation
	short_var = int_var;
}

int assign_long(long long_var)
{
	short short_var;
	// ruleid: integer-truncation
	int int_var = long_var + 1;

	// ruleid: integer-truncation
	short_var = long_var;
}

int test_func()
{
	int intPrimitive;
	short shortPrimitive;
	intPrimitive = (int)(~((int)0) ^ (1 << (sizeof(int)*8-1)));
	// ruleid: integer-truncation
	shortPrimitive = intPrimitive;
	printf("Int MAXINT: %d\nShort MAXINT: %d\n", intPrimitive, shortPrimitive);
	// ok: integer-truncation
	char c = 0x0;
	// ok: integer-truncation
	char cc = 127;
	printf("Chars: %c %c\n", c, cc);
}

// ruleid: integer-truncation
char func(void)
{
	int a = 42;
	return a; 
}

int main() 
{
	printf("Hello, World!");
	return 0;
}