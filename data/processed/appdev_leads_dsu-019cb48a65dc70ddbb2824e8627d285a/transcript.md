# AppDev Leads DSU - Mar, 03

# Transcript
**wesley.donaldson | 00:57**
In these days, I thought you weren't going to be here.

**Stace | 00:59**
Well, then I got the message that it's not running. Is it prod or non-prod?

**wesley.donaldson | 01:06**
That's dev, that is non-prod. Okay.

**Wesley Donaldson | 01:08**
I should like for that.

**Stace | 01:09**
Well, they blew almost everything away, right? There's no reason we should be paying for a bunch of temporary storage for...

**wesley.donaldson | 01:17**
I was thinking... Yeah, but it's disk, is it? It's disk space, not CPU. Yeah, I was understanding.

**Stace | 01:26**
The ABS volumes. So it's just old streams, test users, that kind of stuff. That can probably all go.

**Wesley Donaldson | 01:35**
Nice. Perfect. If we're comfortable with that, let me message you how right now so you can take care of that. Hold on a second.

**Stace | 01:42**
Okay. But we might want to do a quick capacity check on prod to make sure those don't limit it, especially if we just added more of the...

**wesley.donaldson | 01:51**
Current projections and stuff. I'll check right now, but I have been monitoring those and they have been not worrisome. Let me check right now though. Again I was looking to see which is...

**Stace | 02:13**
Writing a lot more scripts and volatility in the dev environment. So if we're not cleaning it up, it's going to fill up.

**wesley.donaldson | 02:22**
Wait, disk used, wait, is this disk-used percent 47%? What is this red? Sorry, there are like three lines here. Maybe you guys know this better. I will share. What's this line at the top?

**Wesley Donaldson | 02:56**
Are you in as pa?

**wesley.donaldson | 02:59**
The last point.

**Wesley Donaldson | 03:04**
I do not know. There's at the different disks now.

**wesley.donaldson | 03:12**
We can look at this.

**Stace | 03:21**
Is that a little information thing next to it or next to the bell?

**wesley.donaldson | 03:24**
It's not. It's just a Safari link that's not working, and then the bell, I guess, would probably just create an alert, and I don't want to do that.

**Stace | 03:37**
Yeah.

**wesley.donaldson | 03:39**
I'll follow up with it.

**Stace | 03:41**
Yeah, somewhere in that CLOUDWATCH thing, there's a way to get more like more contextual information. We should check on that, right? Because that's [Laughter] yeah, that's high.

**wesley.donaldson | 03:54**
But this HU.

**Stace | 03:58**
IP throughput or write cache or something like that.

**wesley.donaldson | 04:02**
We ask for...

**Stace | 04:03**
Usually one right now sends a headroom and everything, but let's check. I mean, because we've got a lot of importing and exporting, there could be older stuff we need to scrape from PD to...

**wesley.donaldson | 04:16**
Yeah, okay, I will follow up with that. There are a couple of things that stay since you're on. I wanted to know... Let me send this to Francis. Francis redline. Okay, I wanted to just let you know. So we've got a notifications issue.
So back in February, when we noticed the issue that had started in January when that got fixed, every leg swap it has either turned on or turned off. So every leg swap we have turned off notifications for a time.
And me how's looking into it. But I'm really worried... I want to bring it up at the architecture meeting about blue greens. So Wes, I don't know if you can bring the right people in there, but we really need to talk about this because it's caused issues a few times over the last month.

**Wesley Donaldson | 05:10**
Yeah.
Help me articulate that. Sam is on board to join the meeting. He's aware of the current issue we're seeing on the current DV so no worries in him joining the conversation this afternoon.
But specifically here, your concern is within the blue greens within the job that switched between the two environments. Whenever we do a switch, is it incrementally or ironically switching, turning off notifications, or the... Assessment is every time we do a switch, it turns off notifications on the old leg or in the new leg.

**wesley.donaldson | 05:49**
Let me get the ticket, and I will scroll through it.

**Stace | 05:52**
If we're topping cues, right? It might need to be... It can be drawn a picture. If we're having services and Blue Greens have their own services and Blue Green has their own cues, I could see where this could happen.
So let's talk about it. An architecture.

**wesley.donaldson | 06:12**
Yeah.

**Stace | 06:13**
So I've seen some things.

**wesley.donaldson | 06:14**
Where it's turning like you could get better.

**Stace | 06:18**
Stay stable. So it looks like a funnel at either end, right? You've got blue green both dumping into one pipe. [Laughter] Then whatever it's live consuming at the end or there's... There might be something we can just do through monitoring, right?
Because each leg is going to have its own monitor group. So you might have to create a cloudwatch, like a dashboard on top of the dashboard. So you have a graph that alerts that's actually combining both legs, so that way you can watch for consistency between the two.

**Wesley Donaldson | 06:49**
I wonder if it's actually intentional.

**wesley.donaldson | 06:50**
Yeah, but we can...

**Wesley Donaldson | 06:51**
So we don't have the non-active leg throwing events when it's non-active?

**Stace | 06:56**
Yeah, well, we have to put a better switch. The dogwatch is aware of what's active on.

**Wesley Donaldson | 07:01**
Yeah.

**Stace | 07:03**
Yeah, let's talk about it there.

**Wesley Donaldson | 07:04**
Okay. Yeah, I have enough...

**wesley.donaldson | 07:06**
So I'm worried because we have... The events have been turning off, like we have stopped turning on... We've stopped emailing people between the leg swaps. And we did have an alert, and that was the alert that was talked about in the postmortem. The alert that they said was never reset after December was still not reset when I was looking into it. I was like, "What's this alert?"
Because I was trying to look into them as I had time. So I looked into it last night, and I realized it's the same alert that's been going on since December. Nobody's ever reset it, and so it wasn't alerting us even between the time that we had that postmortem and now.

**Stace | 07:53**
Yeah, this is important, right? Because especially with the discussions yesterday, if we're going to start the Commerce event source build, where we can make up the emails if they're not going out between leg swaps, right?
But if we're losing sales every time there's a leg swap, that's going to be a problem.

**wesley.donaldson | 08:15**
The leg swap has caused a lot of our production issues, not just this, but other production issues in the last months. So I'm just really worried about the blue-green solution, and that we need to look into it and see that we're doing it like that it's more robust or more reliable.
Okay, that's good.

**Wesley Donaldson | 08:37**
100% here. I'll make sure Sam is aware, and he comes to speak. I'm ready to speak to where we are with the blue-green deployments relative to the issues that we're seeing.

**Stace | 08:49**
Thank you. If Rinor is all available, it might be helpful even if he can pop in for a little bit because I think he did the majority of the work.

**Wesley Donaldson | 08:56**
Absolutely.

**Stace | 08:58**
Okay, all right, thank you both. Okay.

**Wesley Donaldson | 09:05**
Hold on, so Jennifer, hold up.

**wesley.donaldson | 09:08**
Then, he is.

**Wesley Donaldson | 09:08**
I was... I was hopeful to give Stacey a quick status of where we are with the commerce bill.
I could do a top line for you or if you... I can do something inside the channel. Top line is looking very positive. I think one of the risks that we were tracking continually but we knew it wasn't a blocker was just around all these playwrights. All of them are actually in review or already pushed domain.
So, yea, stepping back again, right?

**wesley.donaldson | 09:33**
Really. That's exciting.

**Wesley Donaldson | 09:36**
I think credit to Stefan.
I think he jumped in and really helped out the risk just for us as managing the team. I still think we relied on our heroes to get us over the hump. There's still a bit of pulling the team along and getting them informed.
So I think we prioritized getting commerce through at the cost of using this as a learning opportunity for the Lances and the Germanys of the world, right? So flagging that as a concern, but it's an accepted concern.
So that's a choice we made. The other stepping back away from playwright overall, there is a bit of a concern around some of the packaging. I think there have been multiple tickets and multiple epics related to that have dragged on. I'm speaking...
I've spoken to JPCO about just where that is as a delivery that we've done. So I'm addressing that but keeping putting that in the back burner. We've actually completed. He's clear in the requirements.
From yesterday, we've documented all of the corrections that were necessary. Beth has provided all of the information needed. They have been reflected in tickets. He's provided assurances that will be ready in April for tomorrow.
So feeling good about that. Beyond that, all of the other core features of the experience are working and are complete. Everything is currently in review or ready for product. We are blocked because of the PR issues in review items, but everyone has their task in or has received feedback.
For example, Jeremy pulled back a few things around the confirmation page, but he pulled them back due to feedback. So that's a good thing. Making with the assumption that we'll solve this environment issue. Thanks, States, for his direction. Then we should be able to move all of those into prod today, which would have us set up really well for getting the team and Greg a full review come Thursday morning. I confirmed with Greg that he's available in Eastern, so he's going to do something at 10:00 am. Good on that. What remains that actually... I'll speak to it in the product sync in about fifteen minutes or so.

**wesley.donaldson | 11:37**
Eight.

**Wesley Donaldson | 11:44**
I need to build a pipeline out a little bit more. There are a few things that Beth had mentioned that she wanted to start tackling. I just need to... I'm not sure if Greg is comfortable with that, but I need that level. I need a couple of tickets. We've spoken about a few, like terms of condition discounting that could possibly go... We have worked for the team around the order pipeline after the quarter has been placed, but that's probably for two individuals. Not a lot of surface area there.
So we need a little bit more meat on the bone. We have a small amount of refactor items and you all... I have been speaking about some things that we'd like to try from a process perspective, but that would still leave implementation tasks necessary for the team.

**wesley.donaldson | 12:24**
For the discounts. Hey, Harry. Man, that means that you guys are done, and I didn't get to catch Ray and Dane.

**Harry | 12:32**
Yeah, so I can let you know. What?

**wesley.donaldson | 12:36**
Hold on, let me finish your... Okay, so for West... What was I just talking about?

**Wesley Donaldson | 12:48**
We were talking about the need for additional epics in the back of the team.

**wesley.donaldson | 12:53**
She said that she has the answers for discounts. Are there questions on those?

**Wesley Donaldson | 12:59**
She does. We didn't have a chance to connect before she had to leave, so that's... I just wasn't aware that was in a good state.
So I'll just confirm it in fifteen minutes, and we'll take it.

**wesley.donaldson | 13:08**
Confirm with Greg. If it's in even... I mean, even if he says it's not in a great state, I wonder if we want to just get some solution out there or started on. I don't know, but I wouldn't want to start discounts because they're weird, so I wouldn't want to do those wrong.
We can talk about different things that we could maybe start doing that might be in a close enough direction to at least get us started working on things.

**Wesley Donaldson | 13:43**
Yeah, we can build connections between systems, we can build basic presentations.

**wesley.donaldson | 13:44**
Yeah.

**Wesley Donaldson | 13:47**
There's stuff we can do without having the final data inside of the sandbox. Instead of re-curly sandbox, I...

**wesley.donaldson | 13:54**
We can start setting up the call center app.

**Wesley Donaldson | 13:55**
We can take it.

**wesley.donaldson | 13:58**
Like. And. Like. Get a hello world out there for that. Because that was another thing that we've talked about starting like as far as like a tech wise thing because that's going to be the next thing.
So we can talk to Ray about that as well.

**Wesley Donaldson | 14:14**
Perfect, right? Let me not take up extra time.

**wesley.donaldson | 14:18**
Then, Wes, let's you and I catch up about the other thing that you mentioned about the team. Sometimes I'd like to hear more.

**Wesley Donaldson | 14:30**
Sounds good.

**Harry | 14:35**
Okay. Basics. We have a number of things blocked by the PR environment and the dev environment effectively. The EC2 nodes are full, and so we try to generate users on PR deploy.

**wesley.donaldson | 14:51**
Nothing happens because you're taking care of that. Yeah.

**Harry | 14:54**
The other just shout it to me all he's going to start deleting stuff and or increasing the capacity on those, so those should...

**wesley.donaldson | 15:02**
All deleting things.

**Harry | 15:04**
Yeah, me too. On the Dane's side, there's the caching issue that just requires a leg swap, which we're going to do soon. Probably rather sooner than later considering the current leg that this deployed isn't logging. The updated verbiage stuff is confirmed going on to UT today and should be deployed tonight. Legacy...
I'll get to mine at the end. The admin portal updates just to rather than quietly swallow errors, Dane's added some extra toast feedback for users there that's in review. DJ is out for the last two days.
So the C star colonoscopy stuff is it's come out of blocked as of this morning from the best update, but until DJ is back, it is effectively blocked. Firman has just started looking into the PR error. We don't know what the story is with that yet, Jennifer. As far as the cloudwatch rates, I feel like we did maybe catch a lead with the retries.

**wesley.donaldson | 16:26**
Yeah, I'll look at that. That's on me. Don't worry about it.

**Harry | 16:30**
Okay, and then onto the cognitive stuff. So we've got the RC shows the current situation. I went through it with Ray. That is the scenario. I think when we first went down this road, the immediate scenario was email collisions on family members. Which is maybe not the biggest issue.
It's turning out the bigger issue is that people with old accounts, when they order a subsequent time, they just get a new PA good. So because we gave priority to the original user, they end up logging in with an old user and they cannot see their results. I went through this where he said that... He agrees that's the issue.
So the immediate mitigation is to delete all of the users who do not have orders incognito. The nice thing is we did default to creating everybody who showed up. So the new people will be in there, they just won't have their email.
It could not be updated to the correct one because the old one was there. Once we get rid of the old one, participant updates should update the email to the appropriate Cognito account and we should be good. It will likely require...
I mean, we can rerigger the participant updates just to make sure that propagates, but anything coming out of support will actually work once we delete those people who shouldn't be in there.

**wesley.donaldson | 17:58**
Other than those 3200... But we have that other fix for that. Yeah.

**Harry | 18:04**
So the 3200 was... Those are people we found and thrived who did not end up... Yeah, so exactly right. But now we can't confirm that those are people who are actually supposed to be in thrived. So there's one extra check to do there just to make sure that those people actually have orders.

**wesley.donaldson | 18:21**
So I'd like before you do the delete, and I've said this a couple of times, I'd like to see how many people do we have participants for that are not incognito? Before you do the delete. Can we get the number again?
Because otherwise, once you do the delete, it's going to be skewed.

**Harry | 18:42**
I mean. Okay, so just please say that again. The number of users.

**wesley.donaldson | 18:46**
The number of participants that have a participant stream but do not have a Cognito account on the old or new pool.

**Harry | 18:58**
Gotcha.

**wesley.donaldson | 19:00**
Now that we're only... Now that we have the RFC that we have and the plan that we have, we don't have to worry about the migration yet, right?

**Harry | 19:10**
No. So I think, yeah, if we decide that.

