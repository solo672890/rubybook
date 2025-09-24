---
releaseTime: 2025/9/18
original: true
prev: false
next: false
sidebar: false
comment: false  
---

# 君欲善其事,必先利其器-php
> 先选择一门框架,我选择了 `webman` 框架,任何框架,拿到手后,要先做一个基础的封装.
> 
>  [完整版地址](https://github.com/solo672890/webman_api_basic)
## 启动命令
```
sudo -u www php start.php start
```

## 1. 准备一个刚下载好的纯净版 webman
基本库安装: env
`composer require vlucas/phpdotenv`


## 2. 自定义异常封装

[新增exception handler](https://github.com/solo672890/webman_api_basic/commit/ea86121aeee2f75ce0714f4ed33769f02f25f623)

> /config/exception.php 填写自定义的异常接管类
>
>0. statusCode代表http码,errorCode代表自定义错误码
>
>1. 定义statusCode!==200为自定义异常，在debug开启或者关闭下均不写入日志
>
>2. statusCode===500,代表这是服务器异常,不论是否开启debug,都将会写日志供运维巡检
>
>3. 自动捕获代码造成的异常
>
>4. 如果不希望某些异常写入日志,则配置 /config/exception.php -> dont_report
>

## 3. 自定义日志切割

[新增monolog类](https://github.com/solo672890/webman_api_basic/commit/31b2fa3cd01d5d54b9fa441f18ba418ef28d1ded#diff-105c5234a5091088027caf413691f2a57db1e35f7bea1220503550d103d1f5d1)

> webman本身自带日志没有切割功能,我已经定制了,实现按小时分割
> 需要自行配置 config/log.php


## 4. 自定义日志写入类
[新增buildLog类](https://github.com/solo672890/webman_api_basic/commit/a2d140006be2f736a7b354919d8244cf1f646f4f)
> 框架自带log类写入的方式太简单了,自定义记录的内容会更加详细,并且特殊的channel无需在log.php配置文件中定义.
```` [php]
//调用方法
try {
    $a=1;$b=0;
    $c=$a/$b;
}catch (\Throwable $e){
    //基本调用
    BuildLog::channel()->info();
    //进阶调用  
    //appendLog()复写一条log到 channel dailyCheck区,以便日常巡检
    //log.php 无需手动配置 dailyCheck
    //addException() 记录异常
   BuildLog::channel('dailyCheck')->appendLog(true)->addException($e)->error($e->getMessage(),['test'=>'errrr123123']);
}
````



## 5. 不要在控制器中添加任何属性,因为我已经关闭了控制器复用

## 6. 跨域自动采用中间件处理了

## 7. 接口防刷机制 (参考)
````[php]
//定义方法
public static function orderRequestDelay($user_no, $order_no, $type, $ttl = 2): bool
{
    $key = 'order_lock_delay_';
    $redisKey = $key . $user_no . '_' . $type . '_' . $order_no;
    return Redis::set($redisKey, 1, 'ex', $ttl, 'nx');
}
//方法调用
if (!static::orderRequestDelay($authUser->user_no, $order_no, 'trade_cancel')) {
    return '请求频繁,请稍后再试';
}
````


## 8. 友好reload,restart
server.php设置'stop_timeout' => 30, //重启服务的时候，等待30，如果还不响应master进程的信号，则会被kill -9>

## 9. rpc 远程调用
[新增rpc处理类](https://github.com/solo672890/webman_api_basic/commit/79d42ea67ef2abbddd099e7a2d2ebd2d0d0c0f5e)

::: code-group
```bash [config/server.php]
'rpc'=>[
    //请求服务端的地址 (如果作为客户端,这是请求远端的地址)
    'remote_rpc_address'=>getenv('APP_REMOTE_RPC_ADDRESS',''),
    //客户端监听地址  (如果作为服务端,这是监听的进程地址,用来处理客户端发过来的请求)
    'local_rpc_address'=>'text://'.getenv('APP_LOCAL_RPC_ADDRESS').':12345',
    //服务端处理类namespace
    'namespace'=>'\\app\\extends\\rpc\\',
],
```
```sh [confog/process.php]
//如果你需要将它作为服务端,则需要拉起进程,监听并响应客户端
'rpc' => [
    'handler' => \app\extends\rpc\src\RpcProtocol::class,
    'listen' => config('server.rpc.local_rpc_address'),//监听客户端发送过来的请求
    'count' => 6, //进程数量，默认为1
    'reusePort' => true, //是否负载均衡到n个进程
],
```
```sh [客户端发送请求]
// 请求远端的类 Report和方法
$data=['msg'=>'ok'];
RpcClient::instance('Report','log')->request($data);
```
```sh [服务端处理请求]
//添加处理类
config/server.php ->  'namespace'=>'\\app\\extends\\rpc\\', 
```
:::

## 10. task异步进程
[新增task处理类](https://github.com/solo672890/webman_api_basic/commit/c256c0c7900c01951693fa539228b49ee49ad099)


> 在客户端异步满天飞的时代,个人认为服务端使用异步需要更加谨慎,它不适合处理高并发的任务.
> 进程数量少,并发起来后,性能差,进程数量多,切换进程耗时也不小.
> 需要高并发处理,更加建议 投递到队列进行削峰
::: code-group
```bash [配置异步处理进程]
confog/process.php 
'task' => [
    'handler' => \app\extends\task\factory\TaskServer::class,//异步处理中心类
    'listen' => 'text://0.0.0.0:12345',//异步处理进程
    'count' => 2, //进程数量，默认为1
    'reusePort' => true, //是否负载均衡到n个进程
],
```
```sh [调用方法]
$post = [1, 2];
//Test1 Test2为异步处理类
TaskClient::setHandlerClass(Test1::class)->send($post);
//第二参数可以接收Task::class处理的结果
TaskClient::setHandlerClass(Test2::class)->send($post,function ($res){
    var_dump($res);
    var_dump('收到结果task2');
});
```

:::

## 11. jwt使用

[新增jwt类](https://github.com/solo672890/webman_api_basic/commit/b5847225ea96c3a45b83d3b80927dc51cd99389e)

```` bash
// 一般都在中间件中使用
class AuthMiddleware implements MiddlewareInterface {
    public function process(Request $request, callable $handler): Response {
        
        try {
            $request->user=JwtToken::getUser();
        }catch (JwtTokenException $exception){
            if($exception->getCode() === 30002){
                throw new UnauthorizedHttpException();
            }
            throw new JwtTokenException($exception->getMessage(), $exception->getCode());
        }

        return $handler($request);
    }
}

// 生成token
$token = JwtToken::generateToken(['id'  => $res->id]);
````

## 11. limiterMiddleware 限流方案
`composer require webman/rate-limiter`
> 不适用于ddos防范,ddos防范建议在nginx中配置 [nginx限流](/service/nginx#限流配置-防ddos)
> 
> 虽然可以在中间件中使用限流,但请注意使用场景
> 
> 建议使用ip+userid 在中间件来进行配合限流
> 

[官方手册](https://www.workerman.net/doc/webman/components/rate-limiter.html)

[代码变动](https://github.com/solo672890/webman_api_basic/commit/e173f4212d73b10437169990e8aef3bc04521e60)
::: details 修改源代码

````
/vendor/webman/rate-limiter
public static function check(string $key, int $limit, int $ttl, callable $callback=null,): bool|Exception {
    $key = static::$prefix . '-' . $key;
    if (static::$driver->increase($key, $ttl) > $limit) {
        $callback && $callback();
        throw new RateLimitException('Too many requests.');
    }
    return true;
}


//配置redis连接
````
:::

::: details 调用方法
``````
//调用方法1
Limiter::check($request->post('mobile'), 1, 5 * 60, function () {
    throw new SmsException('五分钟内有效,请勿一直发送');
});

//中间件中使用
class LimiterMiddleware implements MiddlewareInterface {
    public function process(Request $request, callable $handler): Response {
        $request->userId=6;//模拟登录用户访问

        if($request->userId){
            $this->limiterExceptionHandler($request->userId, $request->header('user-agent',''));
            return $handler($request);
        }
        if( $request->sessionId()){
            $this->limiterExceptionHandler($request->sessionId(), $request->header('user-agent',''));
            return $handler($request);
        }
        //开放性产品并非特别适用这个方法,比如抖音快手,在公共场合(火车站)使用公共wifi
        // 但是,游客,手动关闭cookie,请求头又一致的情况不多见,应该由专门的模块对该类型进行日志分析,必要时根据情况,强制登录或是ip封印或是人机校验

        //如果是大产品,比如抖音,应该将用户访问的服务器和游客访问的服务器分开,避免游客(可能是破坏分子)的行为影响到正常用户,
        //如果游客行为疑问很多,此时不能ip封印,容易误杀,建议强制登录或是人机校验,然后对此ip上的用户和游客增加风险标签
        //再给一种比较柔和的方案,对称加密参数,参数里包含用户指纹.根据指纹的情况决定是否 封禁该设备

        //如果是非开放产品,比如核心功能是交易之类,但产品需求也要保持游客访问,则这个方法就非常适用.

        //总结,对这类匿名游客的方法:   1.增加风险评估系统(根据限流日志评估) 2.根据风险等级决定是否 封禁IP,强制登录,人机校验,封禁设备
        $header=$request->header('user-agent', '');
        $customID=$header.$request->getRealIp().$request->header('"content-length','');
        $this->limiterExceptionHandler(md5($customID), $header);

        return $handler($request);
    }


    protected function limiterExceptionHandler(string $key,string $header) {
        Limiter::check($key, 7,3, function ()use($header) {
            BuildLog::channel('limiterException')->warning($header);
            throw new LimiterException('请求频繁');
        });
    }
}
``````
:::

## 12. sql 监听
[代码变动](https://github.com/solo672890/webman_api_basic/commit/d38fe152861aa520cf09211f96bc1e3756f37ca9#diff-f0d0ec9d16c8e7ca3195942e04d2b051cbb424f5a1132499189bcb22cc59ceb2)

> 项目开发,维护,调试时期,查看执行的sql是必不可少的
> 
> 这里的orm模式我选择了thinkorm,主要是要契合管理后台,保持一致
> 

::: details show  code for you
```` [php]
//一定要先注册到 app/bootstrap.php,否则不生效
//return [  //参考
//    support\bootstrap\Session::class,
//    \Webman\ThinkOrm\ThinkOrm::class,
//    \support\ListenSql::class,
//];
 

class ListenSql implements Bootstrap {

public static function start($worker)
{
    $config = config('think-orm.connections.mysql');

    if (!$config['trigger_sql']) {
        return;
    }
    // 进行监听处理
    Db::listen(function($sql, $runtime) use ($config) {
        if ($sql === 'select 1') {
            // 心跳
            return;
        }
        $log = $sql." [{$runtime}s]";
        // 打印到控制台
        echo "[".date("Y-m-d H:i:s")."]"."\033[32m".$log."\033[0m".PHP_EOL;

    });
}


//如果是larval orm
public static function ifLarval($worker){
    $config = config('laravelorm-log.app');
    if (!$config['trigger_sql']) {
        return;
    }
    // 进行监听处理
    Db::listen(function($query) use ($config) {
        $sql = $query->sql;
        $time = $query->time;
        if ($sql === 'select 1') {
            // 心跳
            return;
        }
        $bindings = [];
        if ($query->bindings) {
            foreach ($query->bindings as $v) {
                if (is_numeric($v)) {
                    $bindings[] = $v;
                } else {
                    $bindings[] = '"' . strval($v) . '"';
                }
            }
        }
        $sql = self::replacePlaceholders($sql, $bindings);
        $log = $sql." [{$time}ms]";
        // 打印到控制台
        if ($config['console']) {
            echo "[".date("Y-m-d H:i:s")."]"."\033[32m".$log."\033[0m".PHP_EOL;
        }
    });
}
/**
 * 字符串处理
 * @param $sql
 * @param $params
 * @return mixed|string
 */
public static function replacePlaceholders($sql, $params) {
    if (empty($params)) {
        return $sql;
    }
    $parts = explode('?', $sql);
    $result = $parts[0];
    $paramCount = count($params);
    for ($i = 0; $i < $paramCount && $i < count($parts) - 1; $i++) {
        $value = $params[$i];
        $result .= $value . $parts[$i + 1];
    }
    if (count($parts) - 1 > $paramCount) {
        $result .= implode('?', array_slice($parts, $paramCount + 1));
    }
    return $result;
}
````
:::


## 13. code 码
> 规范的项目必不可缺少的

::: details code表,有待继续完善
````
全局code码 1:成功 0:失败

10000 验证通用错误

10001 短信发送失败
10011 触发拦截验证器 10秒请求超过30次

10100 安全通用错误
10101 触发中间件限流

20000 配置通用错误

30000 用户类通用错误
30001 该账号已在其他设备登录
30002 身份验证会话已过期
````

:::