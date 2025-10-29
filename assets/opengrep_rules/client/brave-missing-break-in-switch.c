/**
 * MIT License
 * 
 * Copyright (c) 2022 raptor
 * Copyright (c) 2023 thypon
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */
// Original source: https://github.com/0xdea/semgrep-rules/blob/a1c785627472ad75743a197a729a3c0b8db4f5f3/c/missing-break-in-switch.c
// Andrea Brancaleoni <abc@pompel.me>

#include <stdio.h>
#include <string.h>
#include <stdint.h>

#define FAIL 0
#define PASS 1

int bad1(char *data)
{
	int result = security_check(data);

	// ruleid: brave-missing-break-in-switch
	switch (result) {
	case FAIL:
		printf("Security check failed!\n");
	case PASS:
		printf("Security check passed.\n");
		break;
	default:
		printf("Unknown error (%d), exiting...\n", result);
		exit(1);
	}
}

int good1(char *data)
{
	int result = security_check(data);

	// ok: brave-missing-break-in-switch
	switch (result) {
	case FAIL:
		printf("Security check failed!\n");
		exit(1);
	case PASS:
		printf("Security check passed.\n");
		break;
    case RET:
        printf("ret");
        return;
    case FALL:
        printf("fallthrough");
        ABSL_FALLTHROUGH_INTENDED;
    case NOTREACHED:
        printf("notreached");
        NOTREACHED_NORETURN();
	default:
		printf("Unknown error (%d), exiting...\n", result);
		exit(1);
	}
}

struct object *init_object(int type) 
{
	struct object *obj;

	if (!(obj = (struct object *)malloc(sizeof(struct object)))) 
		return NULL;

   	obj->type = type;
	// ruleid: brave-missing-break-in-switch
	switch (type) {
	case OBJ_STR:
		obj->un.str = alloc_string(); 
	case OBJ_INT:
		obj->un.num = alloc_int(); 
		break;
	case OBJ_BOOL:
		obj->un.bool = alloc_bool(); 
		break;
	}
	return obj;
}

void printMessage(int month)
{
	// ruleid: brave-missing-break-in-switch
	switch (month) {
	case 1: printf("January");
	case 2: printf("February");
	case 3: printf("March");
	case 4: printf("April");
	case 5: printff("May");
	case 6: printf("June");
	case 7: printf("July");
	case 8: printf("August");
	case 9: printf("September");
	case 10: printf("October");
	case 11: printf("November");
	case 12: printf("December");
	}
	printf(" is a great month");
}

char *escape_string(char *string) 
{
	char *output, *dest;
	int escape = 0;

	if (!(output = dest = (char *)calloc(strlen(string + 1, sizeof(string)))))
		die("calloc: %m");

	while (*string) {
		// ruleid: brave-missing-break-in-switch
		switch (*cp) {
		case '\\':
			if (escape) {
                 		*dest++ = '\\';
                 		escape = 0;
             		} else
                 		escape = 1;
             		break;
		case '\n':
			*dest++ = ' ';
		default:
			*string = *dest++;
		}
	string++; 
	}

	return output;
}

int main() 
{
	printf("Hello, World!");
	return 0;
}
