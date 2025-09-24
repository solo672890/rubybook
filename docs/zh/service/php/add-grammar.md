---
releaseTime: 2025/9/18
original: true
prev: false
next: false
sidebar: false
comment: false  
---

# PHP 7.4 到 PHP 8.4 新增语法特性大全
> 我只摘抄了我喜欢的,我觉得有用的
> 

## 📌 一、PHP 8.0
1️⃣ 联合类型 (Union Types)
``` php

function process(int|string $value): bool {
    return is_int($value) ? $value > 0 : strlen($value) > 0;
}


``` 
2️⃣ 命名参数 (Named Arguments)
```` php
function createUser(string $name, int $age, string $email)   int|float { /* ... */ }

// 使用命名参数,这里的?代表类型可以是指定类型,也可以是null
createUser(name: 'John', email: 'john@example.com', age: 30,?string $d = null);
```
````

3️⃣ Match 表达式
```` php
$status = match($code) {
    200, 300 => 'success',
    404 => 'not found',
    500 => 'server error',
    default => 'unknown'
};
````

4️⃣ Nullsafe 操作符
```` php
$country =  null;
if ($session !== null) {
  $user = $session->user;
  if ($user !== null) {
    $address = $user->getAddress();
 
    if ($address !== null) {
      $country = $address->country;
    }
  }
}

//简化为一行代码
$country = $session?->user?->getAddress()?->country;
````

4️⃣ ?? 空合并运算符
```` php

$result = $variable ?? $defaultValue;
== 等价于
$result = isset($variable) ? $variable : $defaultValue;
//它检查的是 是否为 null或未定义，而不是(''、0、false 等),这些“假值”不会触发使用默认值！


$value = $a ?? $b ?? $c ?? 'default'; //链式空合并(PHP 7.4+ 支持)
$title = $post->title ?? '无标题';    //配合对象属性

````

4️⃣ ?: 简写三元运算符
```` php
$a = '';
$b = 0;
$c = null;
$d = 'hello';

echo $a ?: 'default'; // 输出: default（因为 '' 是假值）
echo $b ?: 'default'; // 输出: default（因为 0 是假值）
echo $c ?: 'default'; // 输出: default（因为 null 是假值）
echo $d ?: 'default'; // 输出: hello（因为 'hello' 是真值）
````


5️⃣ `str_contains()`、`str_starts_with()`和`str_ends_with()`
```` php
if (str_contains('string with lots of words', 'words')) { /* … */ }
====
if (str_contains('string with lots of words', 'words')) { /* … */ }

str_starts_with('haystack', 'hay'); // true
str_ends_with('haystack', 'stack'); // true

````
6️⃣ 注解

```` php

// 使用反射来获取,webman limiter插件里有反射的使用方法
class PostsController
{
    #[Route("/api/posts/{id}", methods: ["GET"])]
    public function get($id) { /* ... */ }
}
````


## 📌 二、PHP 8.1

1️⃣ 枚举 (Enums)
```` php
enum Status: string 
{
    case DRAFT = 'draft';
    case PUBLISHED = 'published';
    case ARCHIVED = 'archived';
    
    public function color(): string 
    {
        return match($this) {
            self::DRAFT => 'gray',
            self::PUBLISHED => 'green',
            self::ARCHIVED => 'red'
        };
    }
}
```` 
2️⃣ 只读属性
```` php
class BlogPost 
{
    public function __construct(
        public readonly string $title,
        public readonly DateTime $createdAt,
        private readonly Author $author
    ) {}
}
````

3️⃣ Array Unpacking with String Keys
```` php
$parts = ['name' => 'John'];
$result = ['id' => 1, ...$parts]; // ['id' => 1, 'name' => 'John']
````
4️⃣ 太空船运算符
```` php
太空船运算符用于比较两个表达式。它会返回一个整数，表示这两个表达式的相对顺序：

如果左边的值小于右边的值，返回 -1
如果左边的值等于右边的值，返回 0
如果左边的值大于右边的值，返回 1
这使得在需要对两个值进行比较并得到一个明确的排序结果时非常有用，特别是在排序算法中


$a = 5;
$b = 10;

$result = $a <=> $b;

if ($result === -1) {
    echo "$a is less than $b";
} elseif ($result === 0) {
    echo "$a is equal to $b";
} else {
    echo "$a is greater than $b";
}
````
## 📌 三、PHP 8.2

1️⃣ 只读类
```` php
readonly class User 
{
    public function __construct(
        public string $name,
        public int $age
    ) {}
    // 所有属性自动为 readonly
}
```` 
2️⃣ 独立的 Traits
```` php
// 可以单独运行 traits
trait Hello 
{
    public function sayHello() 
    {
        echo "Hello!";
    }
}

// 直接使用
Hello::sayHello(); // PHP 8.2+
````



## 📌 四、PHP 8.3

1️⃣ Ternary Chain
```` php
// 旧方式
$color = isset($config['color']) ? $config['color'] : 
         isset($theme['color']) ? $theme['color'] : 'default';

// 新方式（更清晰）
$color = $config['color'] ?? $theme['color'] ?? 'default';
```` 


## 📌 五、PHP 8.4

1️⃣ Enhanced Type System
```` php
// 更强大的类型推断
function process(mixed $data): never|bool|int|string {
    // ...
}
```` 
2️⃣  Improved Error Handling
```` php
// 更好的错误信息
try {
    riskyOperation();
} catch (Exception $e when $e->getCode() === 404) {
    // 条件捕获
}
````






