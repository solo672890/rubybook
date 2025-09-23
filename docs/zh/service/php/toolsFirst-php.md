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

[新增writeLog函数](https://github.com/solo672890/webman_api_basic/commit/3d77e6f723e6b157d1cc1e11d0f96f1a089999b1)

> webman本身自带日志没有切割功能,我已经定制了,实现按小时分割
> 需要自行配置 config/log.php
::: details 调用方法
```` bash
writeLog('program error','other',['msg'=>'错误记录'],Logger::WARNING,$e);
````
:::

## 4. 自定义日志写入类
[新增writeLog函数](https://github.com/solo672890/webman_api_basic/commit/3d77e6f723e6b157d1cc1e11d0f96f1a089999b1)
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

