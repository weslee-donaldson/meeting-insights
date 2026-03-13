# Mandalore DSU, Fridays - Mar, 13

# Transcript
**Jivko Ivanov | 00:18**
He always still looked sharp to the man.
[Laughter].

**Antônio Falcão Jr | 00:26**
Friday.

**Yoelvis | 00:27**
Thank you. A nice day.

**Wesley Donaldson | 00:32**
It's crazy here in Georgia. It was 70 degrees the day before, and now it's 40 degrees.

**Yoelvis | 00:40**
Today's chilly, it's 72.

**Wesley Donaldson | 00:45**
Nice.

**jeremy.campeau@llsa.com | 00:47**
Seems like it's always a nice day in Florida compared to up north.

**Wesley Donaldson | 00:47**
Jealous.

**bethany.duffy@llsa.com | 00:52**
Yeah, you're up north to Jeremy. I don't know if you had what we had. We had like a slingshot. I don't know. It went from 75 to 17 in the span of 24 hours.

**jeremy.campeau@llsa.com | 01:03**
It wasn't that extreme, but it was like fifties, 60s, and now it's not that, and I'm closing windows. [Laughter].

**Yoelvis | 01:10**
There was 85 on Wednesday in Baltimore and then it snowed on Thursday.

**Wesley Donaldson | 01:16**
That's crazy. The precipitation adds a little extra to... No, seriously, to the massive weather change. All right, guys, Friday, let's jump in, shall we? Meha, let's get through the... Let's start with the top most important items. P1 for the order ready for 7:54.

**Michal Kawka | 01:40**
Hi everyone, happy Friday. So the events are currently being replayed. Let me double-check for you where we're at. So 350 were currently replayed. We are going to replay 2000 now and see how many evils emails in a trouble will trigger.
If we're good, we're going to trigger the next batch and basically replay them all. So we have in total 5687 events. 78 events. Sorry, it's in progress, so I'm monitoring the pipeline. Jennifer hasn't reported anything from it yet.
From the call center. So I think we're good, we'll see how it goes.

**Wesley Donaldson | 02:21**
Nice, for your next task, can you prioritize, for today if you can just prioritize the getting the blue post mortem prepared for tomorrow for Monday, let you and myself and Antonio connect there's some opportunity for us to pull in some additional tickets from 1.2 for recurring starting those right now.
So we'll pair with you on that. But for now, if you just click... Let's close this out since it was a production issue that we were post-mortem on.

**Michal Kawka | 02:55**
Sure thing.

**Wesley Donaldson | 02:55**
And other thing for you like we that's still on me to choose the right to the next person, but like just prepared to have like a onboarding session today or worst case Monday for who's going to take on this next week.

**Michal Kawka | 03:10**
Sure. In the meantime, I implemented the missing CloudWatch alarms for the dead letter queues, which were unmonitored. There's a draft PR for that. I haven't opened it yet because there was a code freeze today because of the leg switch.
So I'm going to look into the build issue that I'm having here and I'm going to open it for review so we can merge it on Monday.

**Wesley Donaldson | 03:32**
Perfect, thank you. All right, let's go from right to left then. Well, let's start with you, Jiffco. You have a couple of items that I think you have added in PR or have already moved ready for prod for bug fixing.

**Jivko Ivanov | 03:47**
Yes, hi, Tim, good morning, happy Friday. Yesterday, the visual discrepancy is part 4713 is the ticket number. Thank you very much, Jeremy, for the review. I was able to merge it. It's ready for prod. I continued with the 696, the previous visual discrepancies we've been going back and forth with all...
Yesterday that just got me with the last issue in a bit of a rabbit hole. So I switched to the CDK usually when I'm stuck on something. I prefer to stop for a moment, do something else, and then get back to it with fresh eyes.
It was very useful. The meeting we had in the afternoon to clarify my questions for the CDK so I was able to implement that. I put the PR and I'm right now testing it on the PR environment. It's a fully isolated CD cases. We want it from the main stack. Just going through a few iterations there. I expect to complete that rather soon and then I'll get back to that rabbit hole again. Hopefully, I can see differently today.

**Wesley Donaldson | 05:05**
Ten.

**Jivko Ivanov | 05:05**
In short, I expect to complete both tickets later today at this time, no impairment.

**Wesley Donaldson | 05:13**
Excellent. Jeremy, I'm going to go to you next. But before I do that for all the defect tickets, we're really close to getting all those in one big bundle. I'd like to be able to share all of those with the product and the product works. Share the office hours on Monday so that gives us the rest of today to push our tickets to review and disclose them out to...
Maybe Jeff, code, Jeremy, pair with each other to get each other's review. With the goal of getting all of these defect tickets into "ready for prod" so they can be reviewed by product come Monday. Okay, Jeremy. Over to you.

**jeremy.campeau@llsa.com | 05:51**
Yeah, I, those tickets are in review. I just push some change, some of them. Thanks to all of us for your feedback. I just started working on six four. Out. So no blockers.

**Wesley Donaldson | 06:06**
Excellent and tone you to you.

**Antônio Falcão Jr | 06:11**
Hey Tim, good morning. No blockers as well. I just moved back the work on the event patterns. We did decide to take the async projections to avoid the dependency on the Post-Greece event store. So if they sink projections, we can rely on the Subscribe design from EMET and we can keep the current DB as our main event store, which is great.
Yeah, please take a look and review it. You guys have a chance... Obviously, we're going to have the opportunity for me to go through this design and we have the opportunity to discuss a bit of this tradition.

**Wesley Donaldson | 06:59**
So did you...?

**Antônio Falcão Jr | 07:01**
But in any case, it's a simple implementation. It's not a use case, it's a specific one. Go ahead.

**Wesley Donaldson | 07:08**
Are you asking for team member review on a particular on an artifact? Are you asking for us just to like help me with what you'd like review on?

**Antônio Falcão Jr | 07:18**
The review on the code isn't the request on the. It's not. It's not linked to yet, it's probably being linked soon, yeah, but it's a pull request review regularly pool request review.

**Wesley Donaldson | 07:23**
Yes, exactly.

**Antônio Falcão Jr | 07:28**
It's a simple implementation. You guys will find a simple shopping cart implementation that illustrates the patterns being applied through Decider, Xolv, and Projections using LLaMA. That's this...

**Wesley Donaldson | 07:43**
Perfect. I think my question for you here would be if it's worth... Obviously, add the PR to the ticket, but once it's there, do you think it's worth demoing that way? There's a larger explanation of what and why, and then get the review. Or do you think it's better to start with the review? The developer review?

**Antônio Falcão Jr | 08:07**
It's a bit confusing because I don't know the process, this code work is done, so I need a review on it. But either way, I agree. We should make a demo next week about this.
But it's our call. I can keep it paused until we make the demo, and then we move.

**Wesley Donaldson | 08:28**
No, I don't want to do that. So let's get the PR, and then we'll get the developer review, and then we can do a presentation next week.
I probably don't want to wait until Friday of next week because this is important in recurring v2 or recurring 1.2. So let's get the PR today, and then we can do a presentation. Maybe Tuesday of next week.
All right?

**Antônio Falcão Jr | 08:48**
That's okay to me. Yeah, I'm sorry, I haven't finished yet, sorry.

**Wesley Donaldson | 08:50**
You're all this, do you? Sorry, my apologies.

**Antônio Falcão Jr | 08:57**
No problem. Then there is this blue-green implementation to the e-commerce store. So the code work is done. It got reviewed, coiled, and put some comments on it. I did address those comments, and now I'm triggering back the code review.
But if you guys... Okay. I intend to run to merge this on Monday because it will affect the DNS. Maybe someone will tend to work on the weekend. I don't want to cause any problems in that matter. So, it's ready.
It's supposed to be ready, but I will merge this on Monday morning.

**Wesley Donaldson | 09:38**
Sounds good.

**Antônio Falcão Jr | 09:39**
That's. That's up.

**Wesley Donaldson | 09:40**
Probably worth posting inside the channel as well that we're going to do a release for this, just to see if this shouldn't impact anyone else. But just post there, let everyone know it's going to happen on Monday. I can show you where... If you're not...

**Antônio Falcão Jr | 09:51**
Okay, deal.

**Wesley Donaldson | 09:51**
Okay, I think my ask here would be to feel like a demo moment, just to share with the larger team of this new environment coming out.

**Antônio Falcão Jr | 09:52**
I cannot demo because it's not working yet.

**Wesley Donaldson | 10:00**
So maybe share this as part of the demo today. Thoughts?

**Antônio Falcão Jr | 10:11**
I'm a bit confused, but I can talk about it.

**Wesley Donaldson | 10:12**
Yeah, there's no way to show that without actually doing it.

**Antônio Falcão Jr | 10:14**
Yeah.

**Wesley Donaldson | 10:18**
Yeah, I would talk... Let's just talk about it on the demo today. Just the teams are aware of it.

**Antônio Falcão Jr | 10:24**
Okay.

**Wesley Donaldson | 10:25**
Apologies. Now you owe this to you.

**Yoelvis | 10:31**
For me, I just... Okay, those are not my... I say why I have so many in review and... Okay, for me, I just move two of the tickets for review.

**Wesley Donaldson | 10:41**
He.

**Yoelvis | 10:48**
Those are... I created pull requests, and I did some refactorings.
So yeah, was I ready for review?

**Wesley Donaldson | 10:56**
Okay, cool. This one feels like a sizable enough and worth demo, I guess, opening the question of what we want to demo. Do you want to share this as part of today's demo team demo?

**Yoelvis | 11:09**
I could probably do it testing locally because I don't want to wait fifteen minutes in the demo.

**Wesley Donaldson | 11:16**
15 minutes? Yeah.

**daniel.young@llsa.com | 11:18**
You know?

**Wesley Donaldson | 11:18**
Totally understand. Cool. Okay, let's keep going. It's Francis on... I don't think he is... I would have asked him, so no worries there.
Well, Daniel, you're on. Can you speak to any status updates on this ticket?

**daniel.young@llsa.com | 11:42**
Not really. It's been back... We'reing on our side for a hot note, but we'll be back to it next week.

**Wesley Donaldson | 11:49**
I think in speaking to Francis, he felt that maybe this could be something that could be completed next week. Does that sound about right?

**daniel.young@llsa.com | 11:55**
Yeah, that's the go. We have to do some research. I've been in talks with Expedient about trying to figure out how we're seeing some other issues, some routing things, and so we'll find it back burner, but so I can't give a good technical update, but yes, I'm hoping that we can complete it next week. I just can't give a path on it.

**jeremy.campeau@llsa.com | 12:13**
Unfortunately.

**Wesley Donaldson | 12:14**
No worries. Jeremy, do you...?

**jeremy.campeau@llsa.com | 12:21**
I just picked this up. I just started it, so no blockers.

**Wesley Donaldson | 12:25**
No blockers? Okay, yeah, I think the... I'm sure you saw this, but it's a subset of the overall task. It's not literally everything inside of it. The bigger worry on this one was just what was already done versus what needs to be done. There's a bit of an audit first and then tackle what's in the last comments.
Beth... That's actually... Should be Jennifer. Okay, I can still work with her offline on that. Okay, so I think that's everything that's in progress. There are a few items still to be pulled in. Is everyone clear on the next item? They have... Does anyone not have a next ticket for them to tackle after the current ticket they're working on?

**Yoelvis | 13:14**
I have... Something that I need before I move forward with one of my pull requests is for the membership one I created. EA toast... A notification when the user is adding the membership and they have some individual test.
So I just need a design review or a design in Figma or something to know if the notification I'm displaying is okay because I don't like it too much, to be honest. I need feedback. What is it?

**bethany.duffy@llsa.com | 14:00**
What is it for?

**Yoelvis | 14:02**
It's for... This ticket is when you go to the individual test, the review page, and you add, for example, cortisol. But then you go and add the membership at a later time. Then cortisol shouldn't be included in the card right now.
It's still there that the issue we discussed yesterday and this ticket is... So for fixing that... So if the user already had cortisol added into the card, we are removing that from the card. But we are displaying a notification.
That notification is the one I need help with. The notification is just saying, "Okay, cortisol was removed from the card, something like that."

**bethany.duffy@llsa.com | 14:52**
Think we can pause on that? That does not need to be part of the production release because the cart preservation feature will include those things right now. When they go back and select membership, all of their diagnostics are removed from the cart if they make a package change.

**Yoelvis | 15:13**
No, but it's like right now you can add the membership on the individual diagnostic page as well.

**bethany.duffy@llsa.com | 15:21**
Right on the review page. I see what you're saying. I don't think that needs to be scoped for production. I think it's a good question, and we can take that back to the design team and see if they want to surface a message, but I don't think that holds up for release.

**Yoelvis | 15:38**
All right, so I can't remove the message. It's better for me.

**bethany.duffy@llsa.com | 15:41**
Yeah.

**Yoelvis | 15:43**
I just did it because what's here in the ticket requirement, maybe you can clarify that. Wesley just put the remove that requirement or something, and that's it.

**Wesley Donaldson | 15:53**
No, thank you. Can I...? There are two tickets that... Antonio, you have one. You have one. Can I ask you just to give a 30-minute time block on each one of these? Just review the tickets, see where it's currently at, and if it can be closed out or if it needs to be put on hold, just let me know again. Asking for just fine, 30-minute time block. Only 30 minutes to see if we can close these two tickets out, please, or give me an update on them.

**bethany.duffy@llsa.com | 16:23**
Okay, yeah, I have a quick question for Jeremy.

**Wesley Donaldson | 16:24**
Right. Thank you guys, so much. Yes.

**bethany.duffy@llsa.com | 16:27**
I don't need everybody else if you guys need to jump. We had Shopify failures because for some reason Shopify didn't add the last name to the customer account, even though we have the last name in the billing information. Customer service put together a spreadsheet with the Shopify order ID in the last name. Can we use the script that you've previously used to just rerun them as about 60 orders?

**jeremy.campeau@llsa.com | 16:51**
We'd have to adjust it a little, I believe, because the way it works is it's scraping basically the data from our logs. So if the data wasn't a part of the actual order log, which it wouldn't be based on my understanding of what's happening, we just have to create a new script that says, "Okay, scrape the data."
But if you find this order ID, then use this name instead or something. So it's doable, but we'd need to write something new.

**bethany.duffy@llsa.com | 17:26**
Okay, I will chat with Jennifer about it, because I think Nick was looking into it. So it might just be you handing some stuff off to Nick, but I will let you know.

**jeremy.campeau@llsa.com | 17:35**
Okay? Sounds good.

**bethany.duffy@llsa.com | 17:37**
Okay, thank you.

**Wesley Donaldson | 17:38**
Nice. Thanks, guys. Bye all.

**bethany.duffy@llsa.com | 17:41**
Have a good one.

