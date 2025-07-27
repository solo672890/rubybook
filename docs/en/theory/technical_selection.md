---
releaseTime: 2024/3/25
original: true
prev: false
next: false
editLink: false
comment: true

---

# Technical Selection for Small and Medium-Sized IT Projects

In recent years, I’ve often heard peers constantly talking about high concurrency, microservices, cluster architectures, which languages are garbage, and which are good.

At first, I would try to reason with them. Now, I can only say, "You’re absolutely right."

Personally, I find these people quite annoying. They don’t care whether the project actually needs these technologies; they just blow things out of proportion to make themselves look impressive.

99% of projects don’t require these so-called "high-end" technologies, yet they insist on using them. Sometimes, I feel sorry for them.

They learn these things to avoid being left behind, to keep up with the competition, but after learning, they rarely get a chance to use them. So, whenever an opportunity arises, they push these technologies.

Their explanations sound very reasonable: scalability, high availability, ease of maintenance, and so on.

But they completely ignore the costs—time, money, maintenance, manpower, and technical debt.

These aren’t things developers usually consider. In the end, they mess around, use the project to practice their skills, and if the project fails, they just move on to another company.

But for the boss, it leaves a mess.

Over the years, I’ve worked in several small and medium-sized development companies and even ran my own studio taking on outsourcing projects. I’ve seen many projects, some of which didn’t even make it to launch, and most died within six months.

Many projects, during their lifecycle, only have a few thousand, tens of thousands, or even hundreds of thousands of users. Yet, they talk about architecture, programming languages, concurrency... Isn’t that ridiculous?

So, I decided to write this article.

`1. To let outsiders know the truth.`

`2. To help newcomers in the industry understand that just because someone mentions architecture, it doesn’t mean it’s something grand.`

`3. To share some experience.`

The technical and tool selection I’m discussing here, in my opinion, is more than sufficient for starting small and medium-sized projects.

>
> |            tools            |                   purpose                   | 
> |:---------------------------:|:--------------------------------------:|
> |    mysql8.4\|mariadb\|pg    |             storage tools              | 
> | [redisSearch](#redisSearch) | full text search,replace elasticsearch | 
> |          redisJson          |       nosql josn,replace Mongodb       | 
> |        webman queue         |    queue,replace kafka,rabbitMQ...     | 
> |        Grafana Loki         |       log,replace ELK or EFK...        | 

`When developing web projects, the focus should be on launch time and project scalability, not just technical selection.`

That’s why, in the table above, I’ve only selected a few technical tools.

Developing web projects doesn’t require flashy technologies; the simpler, the better. This way, both development and maintenance costs are low. In my mind, if Redis can replace something, I’ll use Redis.

To do a good job, one must first sharpen their tools. There’s no restriction on programming languages; it’s best to use the one you’re most familiar and comfortable with. PHP, Go, Java, Python—all are viable.

But some people just can’t resist bashing PHP.

I’ve written projects in both Go and PHP. Currently, for business logic, Java, Python, and PHP are more suitable for rapid web development. Go is better suited for crawlers, DevOps tools, middleware, etc.

Some people bring up performance, but I can only ask, "Does your project really hit the language’s bottleneck?"

If it’s just web development, personally, I’d choose PHP and the Webman framework.

Webman, first of all, performs very well for web development and is extremely stable.































