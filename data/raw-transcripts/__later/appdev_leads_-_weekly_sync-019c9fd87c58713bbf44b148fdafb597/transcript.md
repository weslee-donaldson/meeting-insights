# AppDev Leads - Weekly Sync - Feb, 27

# Transcript
**Speaker 2 | 00:01**
Yeah.

**Stace | 00:01**
Definitely. [Laughter] Every logo had a swoop for a while.

**Speaker 2 | 00:15**
What did the early 2000 s E Harmony logo looked like?

**Stace | 00:23**
It was. You know, I don't think it had any decorators, it was just a very blocky.

**Speaker 2 | 00:32**
Yeah. Now I...

**Stace | 00:33**
Short stocky, like blocky habtica ish fon?

**Speaker 2 | 00:37**
Yeah, with like a with a E with like a really Weirdly designed E.

**Stace | 00:41**
Yeah, it had the lower Casey like everything web based in the early 2000 s like any N and I and then Harmony and then there was an abbreviated logo for a while.

**Speaker 2 | 00:56**
Yeah, that's what that would be.

**Stace | 01:07**
Especially in the early days. Their design language was relatively simple because of those white-space ads that were so popular, right? It was just people with bright colors, the blue logo and white backgrounds.

**Speaker 2 | 01:18**
Those are really good.
Did they come before or after that I'm a Mac, I'm a PC ads.

**Speaker 4 | 01:37**
That's a good question. Which is... That's still going today.

**Stace | 01:48**
The guys essentially had a lifelong career from the, [Laughter] maybe before I want I would seem to guess it might have been almost the same time.

**Wesley Donaldson | 01:51**
Exactly. He has become. Be.

**Speaker 2 | 02:06**
I was going to say, I think they might have been exactly like... Yeah, pretty... I don't think...

**Stace | 02:11**
The iMac and the PC came until after Jobs was back and dropped the iMac, which had swirling colors and white backgrounds and little music. Same kind of music.

**Speaker 2 | 02:22**
Yeah, they ran from 2006 to 2009. And I would guess those SE Harmy were probably right around that same time.

**Stace | 02:28**
A little bit before 2000.

**Wesley Donaldson | 02:29**
People.

**Stace | 02:30**
Well, they might not have been on all. They're not have been on TV in like 2003 2004.

**Speaker 2 | 02:41**
But definitely growth economically.

**Stace | 02:43**
That little company through especially the early 2000s, maybe to 2012-2014 when the industry picked up on it. But it was the... We bought... They bought the most cable television ad time of any company in the United States.
Now it's a whole market. But what they did is all this remnant stuff, they made all these deals and they had all these people, like every unsold slot they'd buy at the last minute, which is sometimes why you'd see two or three commercials in a row.

**Speaker 2 | 03:20**
So, yeah, I remember that.

**Stace | 03:22**
Cheap blocks.

**Speaker 2 | 03:24**
Yeah, I can remember watching, like, Adult Swim late at night and seeing these, like, back to backy Harmony commercials.

**Stace | 03:30**
Yeah, that was one of those things where they just had a certain price and they'd go in and buy everything right up to the last minute. Then cable providers got wise and started to auction those blocks, and that became a whole commercial thing.

**Speaker 2 | 03:45**
Yeah. Now you see pretty much the same kind of stuff during that you do the right like guess now it's like, you know, car ads and pharmaceuticals and stuff like that. But it used to be like a lot more. They stood out because everything else was a lot of times local or kind of low budget.

**Stace | 04:00**
It's like... There are a bunch of new companies that are seemingly doing the same thing in the digital space now, where you subscribe, and they'll buy up all kinds of media blocks across TV, digital radio, and stuff like that.

**Speaker 2 | 04:16**
Yeah, Salem knows a bond, and I was actually asking... It was picking his brain on that, and there are a bunch that he's looking at.

**Stace | 04:21**
Yeah, I'm fantastic. Sure. I think we have a good product for infomercial-style video.

**Speaker 2 | 04:27**
Definitely. Yeah, we've seen some better at... We just need some better commercials.

**Speaker 4 | 04:35**
It looks like Jennifer stuck some... So let me... I will turn on the recording and then transcribe. Yeah, and then we can just get started with regular updates and then we'll go from there, okay? Harry, Wesley, whoever wants to go first.

**Harry | 04:55**
Yeah, Mona, be short. I look on the board fixes. So changing alarm rate to threshold 5%, which is shame because we're still seeing a bunch of others have looked today. Or is it? We have a clear picture on what the total is, so we'll see what it looks like when we have 5%. Few things stuck still from business. This one the... A few things we did try to go live this morning, but the leg swap is broken. I was looking at that now I'm just raising less... Sorry, I'm moving forward. No, his stuff.
I think these are just waiting on... Yeah, I'm not sure exactly what these are waiting on. Oftentimes it's just some business approval or someone to say, "Okay, it's time to go." This.

**Speaker 6 | 05:52**
This one is waiting for UAT with a call sent on Monday.

**Speaker 4 | 05:57**
Okay. Yeah. The other one too is waiting for, the ol year two is waiting for you a t on Monday with as a list not Asa yeah.

**Speaker 6 | 06:07**
Yeah, we all sit waiting for her to come back. Yes.

**Harry | 06:10**
Yeah, whereas Dane's one is the leg swap issue. I'm still... I posted what I want to do with the migration this morning with an RC just to have everything written down. I think that's the best way at least. Overhead.
We're not going to get... People can resolve themselves rather than calling the call center, which I think is probably...

**Stace | 06:38**
What we want.

**Harry | 06:42**
Other than that, it's all just been fixes.

**Stace | 06:45**
Okay, I like the document. What's the kind of the level of effort difference between the two? They seem relatively the same. Or, yeah, okay.

**Harry | 06:58**
There's some more there's more moving parts to give that smooth, sort of like I tried to log in. By the way, you need to change your password just to go to this new screen. It's not a lot of overhead, it's just extra. Extra moving parts back in front.
And the one that concerns me is the support surface. Because if you leverage Cognito's force change password, the only way you can move forward is if you go to your E mail and you use the new temporary password.
Right? And I think I remember, like that was kind of one of our core concerns from the beginning is that people don't do that. They don't click the links. They don't, you know, unless they're in the middle of the initiating the process themselves.

**Stace | 07:42**
Yeah, I agree. If that option is just going to send out a random, here's a new code for you. Yeah, and in fact.

**Harry | 07:51**
Yeah.

**Stace | 07:53**
So my best advice to anyone is, "Hey, I just got a random code from the site. I'd be like, "Delete it, it's phishing." [Laughter] Exactly. If you didn't click a button and ask for it, don't.

**Harry | 08:03**
Yeah, so... Because we have the rerouting for people who are trying to sign up a second time, we do that precheck. We already have a flow that says, "Hey, you need to go change your password, go to forgot password."
So it just seems very reasonable to do that. If we want to leverage force reset and all that Cognito stuff, we can do that in the future. It's huge. That's everything. The other thing, this did start to look a bit thin. Guys were asking... We've moved into some other fixes around poll upgrades. There's some front-end housekeeping that needs to be done, but we are going to need more work for next week.

**Wesley Donaldson | 08:45**
I don't think...

**Harry | 08:51**
Okay?

**Wesley Donaldson | 08:55**
Cool. I can go.

**Stace | 08:57**
Somewhat related to the board.

**Wesley Donaldson | 08:57**
Next.

**Stace | 09:03**
What's the status on the end of life LLaMA versions?

**Jennifer | 09:10**
Are you talking about the Node.js? That one's in review. Okay, yeah.

**Harry | 09:18**
I asked Dane to have a look at that one. My only concern is that we just need to look through the... There's always going to be an API deprecation list of the different methods and things. Just to make sure that you don't have any surprises. I don't really think there's going to be much...
It's just I raised it this morning in our setup. I just have a lot of scar tissue from doing this at .NET, so I don't want to blow stuff up, but this should go in the...

**Stace | 09:46**
The secret here is. I know it's harder and we're busy, but, we should set a date right on like the first Tuesday of every month or something like that, where we look at what needs to get upgraded and just do it.
That's a good. That's the thing, right? If you're always doing the point upgrades, there's almost it's almost no problem, right? You're not facing a so it's a deprecated stuff. If you wait till end of life, then it's a pain.

**Harry | 10:13**
No, that's true. I'll put a recurring in my calendar.

**Wesley Donaldson | 10:20**
Okay, I can go next. I think this view gets us... It makes it a little bit easier to walk through where we are in the holistic status rather than going item by item. Items that are not completed from prior to the review. Review page. These are around the diagnostic and the product display.
That's not to say that the functionality... The overwhelming amount of the functionality is not there. There are a few things around the edges that still need to be completed. Beth has provided that direction. Jiffco has raised multiple additional clarifications.
So generally, the need for work is there. Most of these are in review, but there are still some things outstanding from these older epics. Jiffco is committed, and he feels confident he has 34 PRs open currently, so not concerned that these are not going to make it. Just additional feedback early this week that he's resolving, but before the review page, everything except for these has been addressed. Thanks to the end or team joining the effort, they completed all the nuances around the appointments, screening, scheduling, selection, as well as some of the navigation footer and header bright chroma.
So looking good from everything up to the review page. Next question, where are we on the review page validation card admission? Then finally, into completing the order that's really encapsulated inside of a few checkout tasks.
So billing information. All these are... I've moved much of these in review. Full transparency to all of you. This has a bit of things in his queue. Most of them are in review, but he and I are syncing after the demo today just to finalize the status on the board.
But he is confident that he has the ability now to validate, push a card, get decline messages from the card, and then complete the purchase, send the order over to Reculy. There is still work that Lance is doing as part of his spike from a few days back and the conversations had yesterday.
But generally, orders are able to be pushed into Reculy, but still holding the implementation ticket on Lance's side in case there are additional things that they need to do. We are able to get a valid invoice pushed in and be able to now send that over to the confirmation page, which Jeremy is working on.
So Jeremy is no longer blocked by the need to actually have our order be pushed into Reculy. So I flagged most of these. Is the next part of our meeting, right? I've flagged most of these as completed.
I've moved out a couple of the launch dates or the completion dates to be reflective of the team's commitment to have all of this done ready to go from Monday morning. So a few of these dates have changed.
But generally, again, we're in really good... So we're in a really good state. The place... Recurringly is probably the most important because that's the culmination of all these things. As I mentioned, your AI feels very confident. He's already... He already has this pretty much worked out. There may be some bugs along the edges or refinement, but generally, he feels confident this is already working and just needs more refinement. We have decided...
I've asked the team to prioritize just doing a detailed walkthrough. It's a bit duplicative, but I think it's necessary to do a detailed walkthrough of the commerce experience and have them speak into their portion of it as needed. You always going to leave that for the demo rather than having a feature-by-feature specific demo. Today, I'm going to move the Engineering Refinement meeting from the end of the afternoon on Monday to the first thing Monday morning. Targeting 09:30 is just to give folks a little bit of time to get their coffee and read their emails.
But the hope for that meeting is that it's the final opportunity... Correction, not final, that's the... We should be depth complete. All commitments made in previous weeks should have been done, giving folks the weekend just in case there's something outstanding. Questions?
Hearing none. Beth, like... As you asked for the end of DSU, let's use the demo to give you that detailed walkthrough. Certainly, anyone else from product who wants to join in the conversation or who else wants to join, please raise your voice. Let's get all the issues on the board... Just quickly touch on that because that is relevant. This epic is what we're using to track the midway point.
As you can see, most of these are either completed or in review, so looking good there. The ones that we had some bugs open a few bugs. Much of these are already solved because these bugs were opened prior to the actual completion of the feature on prior to Wednesday of this week.
So looking good for most of those. Overall, feeling confident that we're going to hit the deadlines.

**Speaker 4 | 15:24**
Yeah. So, Greg, since I'm out most of next week, if you can't make the demo today, then I can run through it with you. I plan on demoing in our product office hour with our business leads today so they can see what we've been doing and where we're at.
I think it would be helpful if we had a designer run through it. Once they address everything that they can see, and they know is an issue, I think if we had a designer run through it, they might be able to see things that I can't see.

**Speaker 2 | 15:59**
Yeah, I told her that this is her main priority. Just be available for any quick changes or if there are any missing states or anything like that. I won't be able to attend the demo today, so I'll find time to do it
with you. But yeah, it's key because it's a main thing we want to show on one of the main things we want to show next Friday in the board presentation.

**Speaker 4 | 16:25**
Yeah. So the demo where the team will be running through it with us will be recorded, and then the product office hours should be recorded. So we'll have that. But I do want to make sure that you and I have time on Monday just to talk about the current status and all that stuff.

**Speaker 2 | 16:44**
Great, yeah, it's perfect.

**Wesley Donaldson | 16:47**
Can you confirm for me? Beth, you guys are walking through the demo, right? We're not handing it to them to run through the process.

**Speaker 2 | 16:53**
No, we'll be walking, we be walking through it.

**Jennifer | 17:04**
Awesome. Anything else on the current status or things that we've done this past week?

**Wesley Donaldson | 17:12**
We are working. So we had that issue with the event store. Just the idea of events that are not known was causing issues for the PDF generation.
So the team has worked through those. Antonio did the resolution for that. Harry, what is it? It was originally 14,000ish you hit eight. He did clean up the rest so that's completed. There's a PR open for just the conversation around, "Do we want to make everything optional?" Not Harry provided some good feedback on that.
So we're going to pair to make sure we get some decisions. Then the bigger conversation around how the event store pivots to the... For the sake of just enabling recurrently down when we actually do order on the back end... He's actively working on that.
I've asked him to prioritize just being able to walk us through that in the next architecture meeting, where his current thinking is. So that's progressing. Not completed, but at least the portion relative to the fix is completed.

**Jennifer | 18:16**
Okay, I did see a PR from him fixing some back like making it safer for like backwards compatibility issues through and some tests and everything.

**Harry | 18:29**
Yeah, it trades build time type safety, though, which is... I mean... Hall was concerned, so I think we're going to chat about it, maybe with Sam, to see if it's worth... I'm worried about the approach.

**Jennifer | 18:48**
So then for next week, I can start talking about some of that I have. I don't have too many... I don't know if we have the tickets for the order proxy stuff, but for next week, I know that after we focus on or after we finish up anything that is for the demo, we are going to be focused on order fulfillment into C Star.
So getting the orders and the participants like all of that information from recurrently into C Star. So doing the webhooks from that... We had talked about this in the Architecture meeting and going both to Thrive and to Event Grid to Azure.
So those tickets are getting created sometime today or Monday, and that'll be one of the things that we're going to be working on after we get done with this push for the demo and the other production support issues that we have going on and then the other thing that we have coming up next week.
We do have some epics created from Beth. This is the membership billing. So as we plan on moving all of the memberships into Recurrly, we're going to have to turn off the nightly billing process that we have.
But we're going to be turning on or setting up some connections from the webhooks. For if a subscription is successfully built in Recurrly, we need to go and make sure that membership is in the right status in Krisp so that they can schedule and update anything that they need to do in Krisp.

**Stace | 20:55**
All of that is mostly right, but the webhooks and the anti-corruption layer and everything from Recurrly that has to play out before we can get the membership updates in any sort of near real time or an event-based way.
So they've got to go in the right order. So at the same time, we've got the data. So, as Jennifer said, it's pretty much right. But really the data is how we get the data once an order is in Recurrly, how we get that end to thrive, and then right store as streams, and then that will kick an event where we then transform and put that data into Krisp.
At the same time, right when we set up all these webhooks, it'll be something on subscription updated or subscription rebuilt. I think they call it actually, they call that subscription re-do. Then that can set... So Bath sync very closely with Garrek because he's working on this process as a Christian.
If we need data. But while all of that is being developed, you know well, we've got the task people being renewed from the sixth. Then we've got another ten days as we're waiting for the next batch of tokens.
Right there is enough reporting. Christian can, as we learned yesterday, himself do the manual batch runs. So there are ways we can operate in the interim.

**Jennifer | 22:36**
Actually, that was something that came up in a conversation. It would be really nice to have data.

**Stace | 22:43**
Yeah, right. And that and I don't think that is an engineering app, that problem, that's an operational problem. And so let's just coordinate on that. So we don't have two sets of teams kind of doing converging or diverging work.

**Jennifer | 23:01**
With Beth out next week, I can try to sync with Derek and Christian.

**Speaker 4 | 23:11**
That's what I was going to say. I don't know that there's anything from a product requirement perspective that would change what you guys are doing. The placeholder epics are there for you guys to create the technical requirements against. There should be... Jennifer Denny, send it to you.
Yeah, I got it. I created so many. Okay, so there is... Yeah, the one for inserting to thrive. We do have the ability to create memberships in the lower environment in recurringly. I think we might just be missing some custom fields for what they're doing in the import.
So in the meantime, we might just want to make sure that now that we have access to more custom fields in the sandbox, I just want to make sure that the membership plans have all the custom fields.

**Stace | 24:01**
I don't expect much turn there, and I'm okay to be wrong because it's probably actually a good thing for our customers if I am. But people aren't knocking down the door to reschedule the next appointment like the day after the renew as much as we'd want them to.
So we usually have a little bit of time to work with the data. Anything they call to ask questions or cancel. So that should be good. On the product requirements, as Jennifer said, I think we can pivot some of the team. Wesley can stay on continuing iterations and building up the feature base and hardening the order flowing into the store.
Right? I think we can have a dotted line clearly completely separate processes and different people working on getting the order once placed in... Recursively into our systems. So then there'll be... It won't be everyone trying to work into as much of a tiny surface area. The other thing, if we don't have them, we should just add from the technical store's perspective on the store when we deploy the web app, right? Make sure we set up monitoring and make sure it's available to the public and we know uptime.
Then I think the backend footprint's relatively light here, but there is a surface area in the graph, and I think there's a Lambda connector that gets the plans right. We'll have another one. That or the same one, right?
That is in to create the subscriptions. I need to be able to see full monitoring on that, right? So I'd love that demo to include being able to go into CloudWatch and see how many times Invoke successfully... How many errors, how many failures, that kind of thing.
So I think this is an instance where we can get that monitoring in place and alert set up before we launch.

**Jennifer | 26:09**
Yeah, and definitely alerting on if we aren't getting things as well, not just on failures.

**Wesley Donaldson | 26:18**
1 Stace what are your thoughts on how Century sorry, I just wanted to know your thoughts on entry fits into the that flow like we've instrumented some of the application around Century, but honestly like we pivoted away.

**Stace | 26:23**
Not going to be able to get it is a failure, right? So I'm sorry, what's it? Go ahead.

**Jennifer | 26:29**
Abnormal.

**Wesley Donaldson | 26:38**
Commerce was Event Store and then Commerce with the next three major buckets. We can pivot towards Event Store.

**Stace | 26:45**
Yeah, I think... Well, what I'd love to talk about or... My honest answer is I already feel this should be the case, right? Why would we ever call a story complete that doesn't have that monitoring now, right?

**Wesley Donaldson | 27:01**
Agreed.

**Stace | 27:03**
That was the idea as we were going to go backwards a little bit in Century on the event store, but everything new we built would be instrumented.
So I honestly expected what's running in the low environment is already logging the Century.

**Wesley Donaldson | 27:15**
I think the target was everything around commerce, and most of the stuff is just... You are right now, but commerce is anything that we do with Emmett, anything we do from an architectural direction, yes, will be in... That's true.

**Stace | 27:21**
Yeah, right, but there's a LLaMA, right? Graph work with Commerce because we've got to do get some posts from the API so we need to know if that service fails or goes down for any reason.

**Wesley Donaldson | 27:37**
What's start?

**Stace | 27:39**
So it's fine if it's not done. Let's just add it to the list for next week or shortly thereafter, right?

**Wesley Donaldson | 27:43**
Yeah. I'll circle back with Antonio on that.

**Stace | 27:47**
It's not going to see that part of the demo, so we got time before it goes live. I just like it done before it goes live.
On that too... I think as I said, with Beth being out, I think those back-end stories, right getting the orders out... But I don't... I think we can do that entire first round with almost no product-level requirements, right?
Because it's really just integrating based on Recurly's own documentation of their own best practices where we talked about in the architecture session, and I threw a quick screenshot on this thing, right?
It's just getting all their raw data out, persisting, and creating that anti-corruption layer, right? So I think we can make all that happen and maybe even then progress from that into the C Star work because we have a working model to work from or there are really no new requirements here, it's just recreating the service that works for Shopify with the data from Recurate.
So I think it gets the product off the hook really mostly technical requirements for the next week or so, and then they can catch up on the next wave of product requirements for features.

**Jennifer | 29:06**
And it's the same. It's the same for the billing stuff too. Yeah. I'm planning on getting all of those stories out as soon as I can. So if you guys can add on to this thing and put the billing stuff on this picture too.

**Speaker 4 | 29:32**
Space if you guys do feel like an architecture decision is going to impact business, just note it and we could talk about it. But for the most part, I feel like our business requirements are more flexible at this point to make sure that we're using a pretty solid system.
So I think that's probably the way my decisions would lead in those scenarios anyway. But yes, I'm aligned with all of that. TED, to strategically plan my out of office to this point where we have the product-heavy stuff out of the way and you guys can focus on the tech piece.
Then when I come back on Monday, I will start pruning out the additional smaller features that we pulled out of scope for this initial piece.

**Jennifer | 30:24**
Okay. If you have any that are already out like that you want us to work on just because we do have a lot of different people... You can give us some of the product requirements. If you have any created.

**Speaker 4 | 30:39**
I'll take a look and see if there's any of that. Are really quick. I might be able to get the discounts piece done today. Then that can be something that they could implement pretty quickly for the membership. Now that we know the way we need to set it up.
So that one I think I could have ready between today and Monday.

**Wesley Donaldson | 30:56**
Nice. Sounds good.

**Jennifer | 30:58**
Thanks.

**Wesley Donaldson | 30:59**
Sorry, Jennifer, just... You mentioned... Are you wanting to take a pass at building out some ethics? I think we have enough from the architecture meeting and what we know of the system to at least start building out some epics and some implementation tasks.
Then, of course, I think we want to get your input into that, Harry. I think it's important that you're aware of all those as well. So I think there's still a bit of... Propose, here's start tasking it out, but then getting alignment from yourself, from Jennifer, from Harry as well.

**Jennifer | 31:29**
If you want to build out about the epics, I would love it. I will never ask for more work. No, but if you need help with anything, just let me know. Then, I was talking with Dane about some of the Azure side of things.
So we might get some of those at least because I'm sure that's less known to you all. If you guys want to take a pass at the other stuff, that works for me.

**Wesley Donaldson | 31:57**
Yeah, I can scaffold stuff for CSTAR, but I wouldn't be able to document greater than that.

**Jennifer | 32:05**
Yeah. So then I'll just focus on that stuff for now. The CSTAR and then you guys can focus on the AWS, and we can get this done.

**Wesley Donaldson | 32:15**
Sound good? And just one as Beth, you already said discount, but if there's anything else that's kind of close. I don't think I'll have enough to give to document that out. I don't think I'll have enough for Monday morning. I may have a few folks that are a little light, so if there's another small epic that you think is close, if you have it on a radar, please feel free to punt it over. Even if we can just focus on you are or if we can just focus on the back end for it.

**Speaker 4 | 32:43**
Yeah, definitely, observability definitely needs to be a priority next week. I don't know if you guys already have standard stuff in place that you can just get started on Monday, but I will take a look through my remaining features and see if there are any that are super quick to knock out and pretty straightforward.

**Wesley Donaldson | 33:03**
Okay, yeah, I have some existing epics and tasks around observ centered around Century, so that could be something that maybe how we can pick up.
But I'll take a look at it this afternoon.

**Jennifer | 33:18**
I want to make sure any of our graph calls and all of that stuff are going through Century, and we have alerting and everything for specifically the commerce stuff set up in a way that we are going to be alerted about
things like if one thing that keeps happening with Shopify is if we don't get any orders for an hour or something like that. That's definitely something that any abnormal number of orders or something like that.

**Stace | 33:51**
Well, let's talk about it because that's not a Century type thing, right? Century is a public-level monitoring thing. So there are business metrics we can catch too to decide what the right place is for that. Some may be cloud watch things, but interval monitoring like a lot of that belongs in business intelligence. The better place to do that is business intelligence.
But we should catch it before they do on our side, because if nothing's happening, there's probably a 500 error or something else going or a god letter queue building or other things that would have alerted us first.

**Jennifer | 34:27**
It's just because it's on Shopify.

**Stace | 34:30**
Yeah, well, and again, that's that can be an ops type of monitoring thing. So, let's make sure we talk about... We do have our Monday engineering refinement. Let's talk about what our standards are.
Because again, this should be just built into the SDLC we shouldn't have to remember every time we stand up a piece of code have a monitoring ticket to... It should just be what we do and make sure we're monitoring the right code level stuff too, right? There are other things you have to do that you can't have. Again, we learn from our noise.
Right. If you're catching everything, then you see nothing.

**Jennifer | 35:19**
Anything else? Thank you. Everyone here at the demo.

**Wesley Donaldson | 35:27**
Thanks. All see time.

**Jennifer | 35:28**
Thank you.

