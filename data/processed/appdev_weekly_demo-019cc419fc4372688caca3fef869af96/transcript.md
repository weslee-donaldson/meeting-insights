# AppDev Weekly Demo - Mar, 06

# Transcript
**Wesley Donaldson | 00:07**
Good afternoon. Slash. Morning. Ha.

**Speaker 2 | 00:13**
Ay.

**jeremy.campeau@llsa.com | 00:15**
Hello. Happy Friday. So many guys.

**Wesley Donaldson | 01:29**
Let's give Harry and Jennifer another 3 minutes. If not, we can just jump in, and team members can just walk through what they have to share. So do two more minutes.
I'm not a fan of teams at all.

**Jennifer | 02:03**
Hello Playm guys.

**Wesley Donaldson | 02:10**
Good.

**Jennifer | 02:12**
Okay, so I'm just looking at who's on. So I don't think this week we actually put together an agenda this time because of the week and how it's been.

**Wesley Donaldson | 02:23**
And to be quarter is we have two items that I asked the team to share.

**Jennifer | 02:24**
So for Mandalor, what do we have from your side?

**Wesley Donaldson | 02:33**
How is going to take us through just the process and some of the things he uses and how he uses AI in his process. Just investigating some of these issues that we've been seeing in the production environment as alerts and such. Unfortunately, if he can go last, it would be preferable. He just has a little bit of a conflict right now.

**Jennifer | 02:51**
He...

**Wesley Donaldson | 02:53**
Then I asked Lance just to walk us through. Much of this was shared last week, but just to walk us through the back end of Recurly. So after you click on that place order button, and just using that as a bit of a reminder refresher for team members as we take on the order placement epics next week.

**Jennifer | 03:14**
Okay, awesome. Then, I'll just bring the attention... Brian Dee and Daniel Young are in here. I did tell Daniel that maybe we would be going over some of the storefront so he could see what it looks like and everything. I don't know how much you've seen Daniel, but if we do... When you go through the back backend, showing the screens that it matches to you, just to help... For anybody that hasn't seen the full demo yet.

**Wesley Donaldson | 03:41**
Yeah, sounds like we should just do a quick walk-through of the full process and spend extra time on the backend.

**Jennifer | 03:48**
Perfect.

**Speaker 5 | 03:51**
That'd be awesome.

**Speaker 2 | 03:51**
Guys, thank you.

**Jennifer | 03:52**
So much.

**Wesley Donaldson | 03:56**
Do we have anything from the. Specific from the endor side.

**Jennifer | 04:01**
I don't know because I know they've done a lot of fixing. Let me see what they can do about some of the tickets that they've got. I don't see Harry on, so I'll reach out to them and see.

**Wesley Donaldson | 04:19**
Cool. All right. Well, Meha, you always tend to go last. So since you can go first, go and take it.

**Michal Kawka | 04:27**
Yeah, sure, I can go first. Hello, everyone. So, since I was primarily firefighting this week,
I'm going to guide you through the issues that we had, how we identified them, how we solved them, and how we are going to prevent them from happening in the future, how we can recover from these issues.
So that's going to be more of a knowledge sharing rather than a demo, but I think it's going to be helpful. So what actually happened this week? We detected that the connectors, which are basically our subscriptions to the Event Store, weren't in an inconsistent state.
Some of them were running old code, even though the deployments were allegedly succeeding. What we found out was that there were two issues combined that led us to the situation. So the first issue was in the workflow that switches traffic between blue and green deployments. As you might already know, we have a load balancer job in GitHub that is supposed to switch traffic between blue and green instances and basically point the live URL to the instance that it has the latest code deployed.
So the first issue was that we assumed that when we query AWS for the load balancer rules which we have here, and the target groups always come back in a fixed order. So we did an array-based comparison on those rules, asserting on index zero and one.
We always assumed that zero was blue and green was one. The assumption was wrong, of course. Even though CDK creates those target groups in blue-green order or the other way around, green-blue as doesn't guarantee that the rules will always return them in the same order.
So it can happen... The switch of the order can happen after cloud formation updates, deployment, and the order can basically change. So we ended up in an inconsistent state because for some of the rules, we were switching the weights, and for some of them, they were basically being kept the same.
You might ask a question: "Okay, don't we have any security check before we search the legs? Don't we detect an inconsistent state?" Yes, we do, but the monitoring didn't catch it because we always only checked the first rule, which was wrong.
So that was just a programmer error that we didn't take into account all of the cases that are possible. We only checked only for the first rule, which was basically this one, and we were just lucky for a very long time that it succeeded because this check returned the correct order.
But the order rules were basically out of sync. So what we did to fix this, we stopped relying on the array order completely. Now we'd attacked the correct leg by the LLaMA as itself. So if I open one of those rules, I can actually open two of them. You can clearly see that each LLaMA has an AS, so that's a green Lambda and that's a blue Lambda.
So now we don't rely on the order of the rules. We always check the AAS of the corresponding Lambda, which guarantees security and consistent state. We check all the rules. So we iterate through all the rules that exist in the load balancer in order not to end up in an inconsistent state. These fixes are already deployed. They are applied to the load balancer and to the job that detects the current state.
Because we have two jobs, we have a job that switches legs, and we have a helper job which allows us to determine which leg we are currently at. Both of them were fixed. Those fixes are on prod.
So it's already working properly. The second issue that contributed was the fact that the production detection was broken. When we're investigating that, we noticed that the LLaMA versions that we have in here... I believe in tags. I'm sorry, I can't find it now. That's a target group.
That's the LLaMA. I'm sorry.
But the second problem was that we're always only deploying to the green load balancer. So the problem was that in the CDK code, there's an environment mapping from production to prod string. The CDK automatically converts it when we generate the resource names.
So as you can see, our LLaMA does... In general, all our resources are named, for example, main prod Lambda something. That's not the case here because that's an alias, I believe, or some auto-generated name, but all our Lambdas and resources follow this pattern.
However, when we were doing that directly in the string in the job in the YAML job in GitHub, we bypassed this process because that was just a shell command fetching the existing stacks. So production wasn't much to prod, it was just production.
So AWS always returned information that the stack doesn't exist in AWS, so it always defaulted to green and always deployed to green. So in the end, we weren't updating the blue Lambda at all for quite a while.
And basically those two issues contributed to the fact that we weren't parking the events in the event bus for the PDF mailer. When it comes to preventing that in the future and preventing data loss, we already have a mechanism in place to be able to replay the events.
So you might not know about this event, so let's treat it as a knowledge sharing. But we have a bucket which is called connector part events. So every event in a connector that's frozen for various reasons, for example, schema mismatch or some nud pointer or whatever, they will be parked here.
So as you can see, we have the buckets that correspond to every LLaMA function which is a connector. So every event that fails will be parked here with no data loss, and it can be easily replaced by a script that we have in the repository.
So in the repository we have a script called "replay parked events" which all of you can use. It just takes as a parameter bucket, Lambda function, region, and profile. You need to point it to the correct bucket and the Lambda function, and you can replay the events without any data loss. I'm actually doing that right now.
Right here I'm replaying the events for the PDF mailer. It's a long-running process because we must ensure that the event is fetched from S3, it's submitted to Lambda, and it returns 200, and there we can safely delete the event from S3.
So it's pretty slow. It's synchronous. There's definitely potential to parallelize that, but parallelism always comes with risks. So this time I'm just going to leave it as it is. Maybe in the future we can refine it to make it a bit faster, because as you can see, it takes about five seconds, maybe four seconds, to replay one event, and you have 12,000 of them, so it's going to take a few more hours to replay them, but at least we have no data loss.
So we have two mechanisms on both layers. The S3 bucket with parked events is an application-level security mechanism. So if the application throws an error, the event is parked in a queue. On the other hand, we have a security mechanism on the infrastructure level because messages that are rejected by Lambda by the infrastructure itself, they are parked in the DALQ so they can be replayed as well.
So this guarantees us full security, full safety, and no data loss because two layers are protected both application layer and infrastructure level, and we can always replay our events with no data loss with some potential side effects.
But that's why we need to analyze the events that we replay. These events that I'm currently replaying, they can be replayed with no side effects because they don't trigger any user notifications, any emails, because it wouldn't make us look good if we replayed an event with a notification that was two months old.
So that's not the case. But speaking of the event analysis, I can share with you my process to do that. So as you can see, for this particular case, we need to replay 12,000 events. That's a lot. So analyzing those events by hand would take me forever.
That's why I utilized AI for such stuff. What I did was I just downloaded all those events from Slack. I have them stored locally. And what I did to identify the issue, what the issues were with those events, I basically told Claude code, "Hey, look at this folder."
Look at the structure of the events. Let me format it for you. Please give me a summary of all errors that happened and tell me on which date it occurred and what was the count. I don't have that analysis right here. I most likely have it in chat with Harry, so I guess I can open it right here to show you what the output was. Yes, it was this one. No, I'm sorry, that was this one.
So park events analysis reports total events 7000. That's why, because I only analyzed for a shorter period of time back then. Error breakdown. So which error types did we have? Print reason is missing and error 2 was unexpected event type 1 occurrence so the connector schema doesn't recognize the results. Print PDF request.
The first one was the event body has type resultly generated with the field participants, so there was basically a schema mismatch. So that's how I approached that problem. You just need to be open-minded with all those tools because then they can really do a lot of things for you.
Sometimes they're slower than you in going through the logs for all the LLaMA functions that we have, but sometimes they're faster. So I was able to identify the issues that we were facing with AI, so I basically gave my quote code access to AWS CLI. I pasted my short-term credentials and I let it just go through the logs to identify what was wrong, and it was right. It was... Code that found the problem that we had the string mismatch production versus pre-live, which would take us probably ages to find out ourselves, because those things can be missed really easily. We're just humans, and we have limited context and limited attention elements too.
But they can be pretty helpful if we use them in the right way. In the end, they are just tools and we need to guide them because they won't do everything for us. But they can really help in such repetitive tasks.
For example, as analyzing all the events, the error types, the counts, and the dates, we don't need ourselves. We can just trust a lens in that. There's one thing that I would like to mention about the events that are parked. We are getting infrastructure to detect that. I opened NPR today, which is ready for review, and it's going to provision us with alerts when events are parked to one of those S3 buckets.
So we are going to be instantly notified that there's something going on, that there's something wrong going on in one of the connectors. We are going to get dashboards per S3 bucket to be able to track how many events are parked.
That's going to provide us with more visibility. It's going to most likely speed up our reaction because if we are notified on teams with an alert that there's an event parked, we just need to check S3. We just need to check teams
and react. Yeah, so we are building measures to identify such issues faster in the future and to prevent them in the future. So, that's it from my side, if there are any questions, I'm happy to answer them.

**Wesley Donaldson | 18:50**
Yeah I'm sorry let me just ask hold questions. Let me just ask the whole questions. Me how is doing a write up of some of this process? We have to take it on the board for that.
But so I want to make sure we leave enough time for the team for Lance to walk us through the commerce sergeant for. Go ahead.

**Jennifer | 19:13**
Sorry. Okay. I heard you say, "Hold questions?" I like the idea of a write-up. I like just hearing some of the things. Knowing when we have side effects on certain types of messages and event types sounds like something that we need not just like as we're running this stuff. Is that something that we...
Maybe we can add into the generation of documentation on the code. Maybe have a side effect, like a list of the events and messages and what side effects they would do.
What you found out in your research? Me? How? Like adding that as an automated process whenever we do any commits.

**Michal Kawka | 20:00**
Sure, yeah, no problem.

**Wesley Donaldson | 20:03**
Yeah. So now from our call, we have an epic for that. I'll add one more ticket to Jennifer's request to that, just to keep it in one place. Let's hand it to Lance just to give him eight minutes.
If folks go a little bit over. Just to walk us through commerce. Thanks, Mia.

**Michal Kawka | 20:19**
Thank you.

**harry.dennen@llsa.com | 20:31**
Yes.

**Wesley Donaldson | 20:31**
Six.

**jeremy.campeau@llsa.com | 20:36**
Now I'll really quickly run to the front end for those that haven't seen it, and then additionally you'll show us submitted purchase so I can show that behavior on the back end, how we're handling it, what it looks like in Curly, some of the info around that. Those of you who haven't seen it to see the sandbox site that we have set up.
If you've seen Shopify or legacy e-com, the flow is going to be pretty similar. So, well, land at a search page where you can find screens. I'm just going to pick one. We have a map on the side. We get to a back-age selection page. I won't give you all the nitty gritty, but the concept is you have the signature package always selected. You have upgrade packages that you can pick.
So I will pick one. You have a membership that you can optionally pick. If you do pick the membership, it does essentially replace the signature package because it's included in the one-life. So we'll see that on the back end and side of recurring the way we market it though, as we say that the first year of membership is free just because the cost gets canceled out. After the package page we get to a review page where you can add additional products to your order and take membership off on this page as well.
You can have a card on the side that you can modify. I guess I am showing this in Desktop here. We have a... The site is responsive so everything has a mobile corresponding view. Just for my use of... On the computer, I am going to switch back to Desktop for a moment.
So I'm actually going to add a vitamin D mean, I don't have a ton of time to go through this, but some of the logic that is not yet in place. If you do get a membership and then any add-on, so an upgrade for an individual product, you're going to get a $30 discount automatically applied.
So again, that's not yet in place on the front end. That is actually in place on the backend. So we'll see that at the end of the list.
I'm just going to fill out the last page of the form, which is just the checkout.
I guess one nuance here that I will call out is I want to share this attack on the back. We have the concept where the billing account does not have to match the participant. In these cases, we are creating a parent account inside of Recurly that handles the billing. It has the invoice and all the products associated with that invoice.
Then we would have the participant account, which inside of Recurly would be a child account whose billing account is the parent. The child account would have things like the membership and any coupons that get applied to the order.
I'm going to make a difference.
I have actually submitted one today, so... If it goes through and the tip is right, so on the checkout, it's personalized to the participant that this order was made for, so they're all set.
I want to swing to a curly to show you what it looks like. Then I'll briefly go through the code that's still in this backend. So this was the parent account that got created. Save this as the invoice associated with it.
So I go to the invoice. You can see where we have the membership. The signature package is removed from the order because that's included in the one-life. Then we have the two add-ons, the package upgrade and then the Vitamin D that they bought.
Then, like I said, the brand isn't shown just yet, but you did apply a $30 discount to the bed.
Again, there's a lot to go through here, but at a high level, just some more information about how this is set up. Our packages right now have custom fields which reference our products.
So it's how we're tying packages to products at the moment. Individual diagnostics do have that same field, but it's always going to be one item at the moment. Then our plans... Few of these... I'm not sure which ones are active or some of these are just still test data, but the idea is that plans have add-ons, so things that aren't included return.
So like I mentioned, the one-light package has a signature plan add-on, and then it has two products associated with it. This is important information because on the other side of this, when we pull this out, we have to have a full picture of what is... What are all the products associated with this order?
So we'll have to be able to take the list of items associated with the order plus the membership if they got one and then break that down to ultimately individual products and packages to what they bought.
It's going to be a combination of an item being able to break down like if it's a package, what products are associated with us, if it's a plan, being able to query the add-ons and then find out what individual items are associated with that. Just at a high level, that's how that INFL is broken down.
Lastly, just answer your information.
The concept of a coupon and we can limit that coupon to only be applied to eligible items. So again, I don't know if this is set in stone, but how we're going to set this up. But the way it's set up now is we are limiting the coupon to specific items in our store.
So if I were to have gotten one life on the store but not got an associated item that this coupon was eligible for, we still would have applied the coupon to the account, but it would not have redeemed on the order.
Sorry. I'm going to go through this. Do you want to do it as quickly as I can? The last thing I'll show is just the backend. How we handle what I was just talking about again. So we did out create purchase input object. We pull out the plan add-on codes, which is used to deduplicate further down.
So again, because we have the concept of... They got a signature package on the order, but they got the one-life. Since one-life includes the signature, we're going to be taking the signature off the order so that we don't double-bill. Then this guy here is still a work in progress, but it's the concept of it.
It's not the same as the billing. Then we have the concept of a parent account that we create.
That parent account is used further down where, when we create the participant account, we do the same check. That is the parent-child relationship when we create that child account and to set the bill to the parent with that parent account that you previously got if it's a standalone account.
So there's no parent-child relationship, and that account gets its billing information.
This is the logic here for adding a key phone. So again, the only logic right now is basically if you got a plan, give them a key phone, and then let you decide if you could apply it or not based on how that phone was configured.
The only other piece of logic is what I mentioned earlier. You just have that deduplication logic where if something that is in your cart is included in the plan add-ons, the plan that you got... Just filter those out so that we don't double-charge inside of a...
I think...

**Speaker 2 | 33:28**
At a...

**jeremy.campeau@llsa.com | 33:30**
Going a hundred miles an hour. That's kind of a high level of his storefront. Plus, Aricly set up there with no questions.

**Jennifer | 34:00**
Awesome. So that was the... I know we talked about a couple of things. Do you want to start?

**harry.dennen@llsa.com | 34:17**
Sure. I'm going to have to share my whole screen, which is very wide, so you guys are going to have to zoom around. I don't want to keep shifting around. So I give you... The background here is that we took control of the user creation for Cognito users so that we have PEK with usernames. This allows us to search, and it gives us full control over what their logging method is, and various other things to accommodate for the limitations of Cognito. One of the premises we built this on was that users have one PEGO, which ultimately is not true because sometimes when people make orders five years later, they make another one, they get a new PEGO. Sometimes they change their order, they get a new PEGO. This results in the user logging in to an account which was the first one to be created, and they cannot access their latest results.
So to mitigate this, there are a number of things around the control of creation of users, but it does have us in a situation.

**Jennifer | 35:21**
I don't think we can see your screen, Stefan. I was wondering that too.

**harry.dennen@llsa.com | 35:27**
There we go. It is a full screen. So this puts us in the situation where we end up with users who have user accounts, which should not be... Yeah, you guys can zoom into this one. So we end up with a tremendous amount of users.
So of these 300,000, roughly 43,000 were the ones that were unnecessarily created. We have a lot of noise that comes out of legacy. Like I said, there are a number of mitigation efforts to control the inflow. When we went down this path, we understood there were a lot of unknown unknowns, so we took the decision to default create.
So if they didn't end up with an email, they didn't end up with a phone number. At least the account was incognito, and we could resolve from there. So we effectively took the problem of "I can't access my results" in the old situation to "I can't sign up in the new situation."
So dealing with legacy complexity in different ways. Even though we have 300, I think our MAU (monthly active users) is around 107,000. So lots of people who get results maybe by paper or maybe through some deal, but they don't actually have to log in.
Either way, I think we're only charged on MAU, okay? So the situation then is to delete. These guys have a script here. I have two scripts actually, so one is the actual deletion, which is straightforward. The way the deletion works is it's currently running here. You can see it's busy chewing through our 41,000 that I had. I ran a couple of test runs and slowly increased the size of the batches until I was confident we could run the full one.
So the way this guy works is you give it your full list. It produces a deleted which we can see is happily cruising along. It gives us a deleted timestamp and a participant ID. These two things are necessary because I will have to use the second script to append these to the user streams. The reason that we do that... Let me just finish here.
So the progress gives us a complete account and failed P goods. That way, for any reason there's a network drop or something goes wrong, I could just reconnect, get my new session tokens, and continue where it's left off.
So those are the three we've got deleted and in progress. Then this will be my next list when I'm ready to run the second one. It effectively does a similar process. It's just appending to the stream rather than deleting, and it's using these two values. Those values are important because when I append these to the stream...

**Speaker 2 | 38:22**
I will end up with...

**harry.dennen@llsa.com | 38:28**
Co activity is not the one, it's CGNEO accounts, right? Look at that. We're going to have to reconnect. I got my handy list of... Scripts. Let's start ourselves back up or a new session. It's just a port forwarding session.
Okay, so we're back in. If we look at the stream browser, we can see accounts is the one Rinor added. This guy writes straight from a connector. This is the stream that will be being augmented with lots of other cognito things.
If I go to Aurora, I can now run this query, which now has a new column "deleted". So this is a soft delete. We don't actually want to delete people from a database, but we do want to mark them as deleted from... This way I can run this little command here. Oh, that's because I can't run. Just Lena, don't highlight things when you run.
Okay, so these are people who, for whatever reason, logged in. They won't have any results, but they did log in. So I can take one of these guys. Just take a little random one... Virtual event's dream. We're already on one of these.
Look, there we go. So I can have... I've got two events here. So the first one you can see the envelope type is... Password set. It should technically be this one, which is what all the other ones do, which is gives you the stream.
So this is something that came in a while ago, but if we look here, we got a password reset. So for whatever reason they came in, they logged in and then the next one will be our cognitive account deleted.
That way we can see the account, status stuff straight from here. Activity will be a different stream. And that's pretty much it where we are with the cognitive stuff. Next week we'll have more to talk about.
You know how we control creation of users? How we allow support to edit users? How users make changes to their own accounts. Any questions? SAP which other alone?

**Jennifer | 40:59**
This is going to really help clear things. So one other thing just going further from that is that Stacey had mentioned when I was talking to him about this is that eventually, when we have these soft-deleted users or participants, we can... The event source currently has the scrape function, so it can eventually clean up some of these old users, if they've been deleted for so long ago or something like that.
So there is this idea of scavenging the data, so soft-deleting will allow us to eventually be able to do that. Cool. Were you able to share about the VPN?

**Speaker 2 | 41:56**
I... Awesome. I mean on my screen. So context, we want the admin portal to only be accessible from the VPN from the... VPN. So all internal users to be able to access the admin portal. Essentially, the admin portal has two components: the front end, which is an S3 bucket where the assets are stored, and a crowd from distribution that allows us to connect to the content, access the content in a block, and the API gateway for the GraphQL supergraph, which is the same one that we use for free. Which is public.
So the change that we're making has two phases. The first phase is to protect the public website, the front end, and the next step or the next phase is to create an API gateway that we can make private so that it is only accessible from the VPN if you're connected to the... VPN.
So what we just did last night and right now we're still deploying some of the changes. We are making the S3 bucket private so it's no longer a public website. BET. So it can only be accessed via the GraphQL distribution with an origin control.
So now the bucket can no longer be accessed directly. So it forces the people to go through the distribution in order to access the bucket. And we created WAF access control list that is attached to the CRAFTONE distribution so that certain IPs, public IPs, are only the ones that can access the distribution and eventually the content in the book.
So that way we can enforce that only people connected to the VPN since they will browse the internet... Actually, they will browse the internet to this website using a specific IP public IP so we can use that in the web access control using Grafront to enforce that only those IPs can access the page.
So this is deploying as we speak. Actually, for production, the WAF is now being deployed, but it's already deployed in non-product, so we can check that out. So this is the non-prod admin portal right now.
If I try to access, I get a DNS resolved failure. Because as part of the changes we made last night, we are only resolving this name with the internal domain control. I think the name is domain controls.
So only if you're connected to the VPN you can resolve the name. So that's why it immediately gives me an error. But if I try to go directly to the crowd domain name, the distribution domain name, which I can see here quickly, I should see a blank page. That means that Graphron is not allowing me to see it. That blank page can be customized. Let me quickly show that.
So right now the non-prod distribution for the admin portal is this one, and if you go to security, you'll see there's an AWARO attached to it. This WAF rule has an IP set that only allows requests if they come from this IP. I can go to the... Here. This is the one for non-prod.
So it has... This is the IP that LBS gets when people browse to that page from the VPN. So if you try to browse it without being connected to the VPN, it will not be this IP, so it will be blocked.
So if I go back to the Graphron distribution, I can get the domain and T access. Is that clear? Let me try that. I should see a blank page shouldn't load anything. We can make this blank page. We can throw an error HTTP response code for 1 unauthorized or 43 forbidden. We can customize this, but I might not be worth it because it...
It's only shown if you go directly to the Claude distribution. Nobody should be doing that, as I said, if you go to the domain, it will not be resolvable because of some of the enforcement that we're making.
So now if I connect to the PN, which I'm going to do now, if the connection drops, just bear with me for a second. I'm the GPM.

**jeremy.campeau@llsa.com | 46:47**
Probably would be a bad idea to put some sort of message there.

**Speaker 2 | 46:51**
Yeah, and it would be... It would be like a directive... It will be indicative of what is happening. Maybe we don't want to do that because it's going to be a... You cannot do this or something like that. It's going to be only visible if you go directly to the distribution, which nobody should be doing.
So now I'm connected. This should change for me. Now, you see, I can see the page now. If I go to the distribution directly, I can see the page too. So now, Claude is allowing me to access it.
So yeah, those are the components. The next step is to add the gateway, a private gateway so that we can protect the Claude supergraph API. At least for this, for the... The... As we speak right now, it's going to go to production, but we just deployed it to non-prod now. Added the WAF rule. The WAF rule is just the access key I showed that blocks traffic if it's not from that IP and another bucket is only accessible through the distribution. No longer a public website. Website STD block.
So yeah, any comments or questions? I think that's pretty much all.

**jeremy.campeau@llsa.com | 48:13**
Or...

**Speaker 2 | 48:15**
Yeah, if you guys have any comments or questions, feedback...

**jeremy.campeau@llsa.com | 48:22**
Thanks for working with Dan on that.

**Speaker 2 | 48:23**
Francis, thank you. Life yeah thanks alright.

**Jennifer | 48:31**
Awesome thank you. And then. Dane. Were you able to, present or to demo?

**Speaker 5 | 48:43**
Sure. I will do my best to be as boring as possible and put everyone to sleep here.

**Jennifer | 48:50**
Well, that's the best, because we all probably need a nap.

**Speaker 5 | 48:54**
Yeah, this will be essentially just a trip down production support lane in regards to sinking spot results into Thrive. Some of the things that I've come across explaining some of these certain scenarios as business reaches out to us and explains them, what that ultimately means, and why they're occurring.
Then I just go over some of the more common troubleshooting steps that I go through. Just for anyone that's not aware, we do have quite a bit of documentation around this.
So we have a couple of bullet points here of some known things and some recently discovered issues. So think in your mind, right, at the top of all this, right? As these are starting to be explained away, right? You get normal visibility of these issues just by the squeaky wheel noise coming in through the call center. You've got participants that will call in and say, "Hey, I'm seeing some of my results, but I'm not seeing all of them." By the time someone is starting to handle that case, they're realizing that they're missing their lab results and something has gone terribly wrong with our ability to sink those lab results onto their stream and then effectively present them back to that participant.
So we have great insight now into what those participants are seeing with our admin portal. But one of those cases that we discovered recently is whenever we have to send manual requisitions to the lab via Spot. We had an error in our API where we were not correctly establishing the metadata that was necessary on those requisitions for appropriately tying the resulted values back onto a THR stream.
So what does that mean and what does that look like? First, we're going to take a look at one of those cases. This is a participant inside of the spot management portal here, Reita Brummett. You can tell typically for two indicators, right? When you're looking at these requisitions, whether you're looking at them in spot or you're looking at one of the payloads that are coming back on our spot sink, they'll all have similar markers, right?
If they're coming through the manual tool, one of them is going to be that the participant name is going to be in all caps, and then another one is going to be that when you take a look at the requisition and its details for the metadata here, you'll see that we are erroneously sending in an empty participant guest, which is no good, right? Amongst other things, we're sending it a zero screening ID.
So this error was recently patched this week. The... I shut up a change to their recurring jobs API that the tool essentially leverages, and that API needs to be able to paint source and paint this information correctly because otherwise what will happen is once you get your payload for Anita here...
So we'll have an empty participant guest, and there's no way for us to identify your stream, right? The appropriate participant stream, and then there's no way for us to attend these results onto that stream.
So just to verify there, right, and take a look at that JSON payload, some of the things that I typically do... There are a couple of different ways, right? I could go into where we're recording some of this data in our legacy databases. This spot ID is an external ID that we will keep on hand, and it will be on a couple of different tables.
It's going to be in our CR DB, and then most prominently, it's going to be on this appointment blood card processing status table where we are keeping track of... Every time we're sending requisitions right out of that API to spot.
So one of the things you could do really quickly is you could just take that key, and you can look up on the spot ID column here. I'm just going to do that really quickly. So you can see here from the PWNTOL, which, of course, is another marketer for a manual order being requisitioned. We were trying to manually requisition cortisol, vitamin D, and everything that's inside of this panel of tests here for the gold package. What's extremely helpful, right as we get this keyback from Spot, is what we keep track of as far as our recording data when we send this.
So you know exactly when we tried to send this manual requisition. But then ultimately from Spot, one of the other things that you can take a look at is the details version of this. As you get some date timestamps of when Spot is trying to reconcile this with the lab or they're getting their information back from the lab.
So this is an incredibly useful timestamp here. This state resulted says that it came in towards the end of the day on February 11th, which then lets me know approximately when I can expect to find this on our daily spot sync.
So I'm going to hop over to AWS here. We do have a cron that runs daily and an alert around that. I believe it runs around 12:00 pm E Eastern every day. The idea is that on the day we are looking for a 24-hour period prior to that day as far as results or anything that Spot can present to us as being updated or modified.
So for the 11th, I can expect that we pull that on the 12th. So we'll just look here for a date modified to the 12th, and I would expect to get a February 11th payload here. Download it really quickly. Expect it to be relatively large here.
Then one of the things that I can do is then verify what that JSON payload looks like as we're syncing it in or sending it onto our upload bucket for our upload landed. Then process Spot ID. That's what we're looking for here in this JSON payload.
And you'll usually get about five of these hits here, right? Because the nature of this payload has requisitions at the top and then keyed requisition details based on the requisition idea.
So you can see here that the top requisition first hit here is just going to be a lot of the top information or that of that requisition object that comes through the first API call. And then when we're sourcing the details, we didn't have them keyed underneath of that same requisition idea.
But ultimately, what we truly care about is as you pass the reporting section of all the lab results, it's going to be this guy here, this metadata and here we can definitely verify, right? This is exactly what Spot sent us, right, as we created out for it and transformed it.
And then ultimately what Thrive is trying to ingest, which is no good, right? So the best way to fix this. Unfortunately, I don't have any... I have AI have a couple of different strategies. Right? If there are a bunch of these in mass that I'm trying to look for. I do have a little scriplet in a tool where just locally I hit the spot API and then I just rebuild these payloads with a product good filled out. Another thing that you could do is as you find these right, you could obviously just correct that participant good and drop it back on the bucket and have it be reprocessed that way. All participants from streaming are not available in Spot.
So this is another one of those constant or very common call outs that we get from a results processing team, right? Or by a proxy, yes.

**Jennifer | 57:59**
I might interrupt you just because we are at time. Okay. Does anyone have questions before we end for Dane for what he did share because I think it was really good and enlightening to me on what the spot process is and pulling that in because I think it was a black box for me for a while.

**Speaker 5 | 58:23**
I guess real quick, right before I go, I kind of the more interesting or the more relevant piece of this that will work. We do have quite a bit of documentation. It's going to be spread across our product and development space
and Confluence. So please take a look at order execution and tracing through Thrive. There's a lot of good tidbits in there, especially if you just want to replay spot syncs.

**Wesley Donaldson | 58:41**
One.

**Speaker 5 | 58:45**
This will do it right if you already have payloads for whatever reason did not sync because maybe our projectors or handlers were throwing errors and ultimately not appending any of these events and we're no longer doing that. You can always just go back to a day, replay it by dropping this record into the test event for the Landa. We have normal troubleshooting right for field screening uploads. That highlights some of that legacy process as well.
We have some pretty diagrams for how the intended process for lab orderings should look.

**Jennifer | 59:29**
I love documents and diagrams. Thank you for sharing that. Can you share a link to where some of that is? Yeah, absolutely. Okay, it looks like we're done. If anybody has any questions, let us know.
Otherwise, I just wanted to say thank you again to everyone. It was great hearing from Greg that it was a great demo. The board loved it. I know that isn't thanks to every single one of you, everyone that was working on the project, working on the storefront, and anybody that was making sure to take all the production tasks away from anybody working on the storefront. Everybody had a piece in this and it really is a testament to the full team working together.
So awesome job, everybody. Thank you guys, and yeah, celebrate today. Have a wonderful weekend as well.

**Wesley Donaldson | 01:00:34**
Thanks. Alle.

**Jennifer | 01:00:34**
Thanks, everyone.

