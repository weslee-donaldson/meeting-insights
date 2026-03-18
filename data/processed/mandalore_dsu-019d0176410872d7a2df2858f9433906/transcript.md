# Mandalore DSU - Mar, 18

# Transcript
**Wesley Donaldson | 00:08**
Test. Test. Nice.
Very nice. Very. Very nice.

**Antônio Falcão Jr | 01:06**
Six.

**Wesley Donaldson | 01:12**
Good morning, everyone. I cannot hear you, which is very unlikely.

**Antônio Falcão Jr | 01:14**
Hello, everyone. Okay?

**Wesley Donaldson | 01:22**
Give me one second.

**Antônio Falcão Jr | 01:31**
Can you hear me now?

**Wesley Donaldson | 01:38**
Can I get someone to say hello? Thank you, looking good. Let's give it one more minute before we jump in. Actually, I don't want to run over here. So let's just get started, and we'll touch on whoever's slowly streaming in.
So let's start with Antonio.

**Antônio Falcão Jr | 02:11**
Hey guys, good morning. Yeah, I have this hydration and a CL LLaMA for review. Please take a look, I have a few comments to address, and already working on this. The Migrate TP Commerce. The blue-green one is good.
It's in production already. We had some details yesterday, but Devopstein could make it happen really fast. Thank you for that. So we are good to that one. As I talked with Wesley, I probably will start testing the three tickets related to phase one and in phase two of this re-integrating.

**Wesley Donaldson | 03:02**
I'll walk through this to the end, but that's what Antonio is speaking to one Tonio that I think we need to get on... Make sure we're addressing the ultimate domain for this. The production version is going to be booking that lifeline screening.
So we need to make sure we have a name. I have a domain entry for that and figure out how we're connecting that. Maybe just switching the DSRs figure out our plan of attack for when we actually go to production.
So that's a conversation we need to have today, so to put some thought...

**Antônio Falcão Jr | 03:34**
Yeah, but it's a DNS work only.

**Wesley Donaldson | 03:37**
Exactly.

**Antônio Falcão Jr | 03:37**
Just... And our team can make that okay, no problem.

**Wesley Donaldson | 03:41**
All right, so I saw your PR on this detailed PR, so definitely team, if we can stress the importance of PR review just because we want to have as much time as we can next week to have the system having orders coming through.
So the faster we get to PRs, the faster we can have a full integration test. So please prioritize getting PRs that are related to recurring reviewed, ideally within the same day that they're posted if they're posted in the morning.
Okay, let's keep going. Me? How? You have some P ones on your plates. Let's go to Unix.

**Michal Kawka | 04:21**
Hi everyone. Yes, I'm working on their interpretations ready, so we'll be replaying them shortly. So we discussed that we are going to replay the remaining events today. In terms of the P ones, I have a few tickets in review so cloudwatch alarms they ready for reg leg resolution is ready for review. I posted a markdown. I'm currently documenting the existing dashboards and reports in AWS the sticker was moved to INV automatically because I opened a draft PR, so it shouldn't be there. I'm still working on that and afterwards I'll most likely continue with the purge of the current DB because I didn't have time to take care of that yet.
But I think that prod issues and prod tickets are more important than the dev environment ticket.

**Wesley Donaldson | 05:23**
Yes. I think my only concern with this one is give me a sense of how long we're on it. I want to start work on some of the features you specifically mentioned, for example, chat possibly sending posting another feature over to you as well.
So just give me if this is multiple days, let's talk about it. If it is, then we just need to move that off and put it back into do so you can tackle some UI features that are part of...

**Michal Kawka | 05:49**
No, it's most likely in just one hour. So there's a script to basically recreate the event store DB. I just would do that in the early hours of my time so no one is blocked because PR environment and dev environment reuse the same event store.
So I would like to do that when I'm only around so that no one is blocked on the PR environment. So if I get a green light, I can do that in the early morning tomorrow.

**Wesley Donaldson | 06:13**
The, this tick, it's more about like setting us up for the future than it is about like a one time clean. So maybe just ping and we can talk about it.

**Michal Kawka | 06:22**
Okay.

**Wesley Donaldson | 06:23**
Let's keep going.

**Michal Kawka | 06:24**
Okay, sure. So, the fix should be pretty straightforward.
On the Destroy job, that deletes the PR environment. So the Lambdas that we created on all the stacks. We need to add the step to get rid of the event stream for this particular branch. That's it.
So it's a matter of an hour or two to basically write the code, adjust the script, and verify that it purged the corresponding events during when we destroyed the PR environment.

**Wesley Donaldson | 06:54**
Sounds good. Right? Jeremy, over to you.

**jeremy.campeau@llsa.com | 06:59**
Yes. Yeah, I put that one in pause because we wanted to time box it and I was running into a bug for my current ticket ID. I went along with Jennifer yesterday and I was going over it. So there is a misunderstanding about where the actual logic was for one of the steps in the whole Shopify process.
So based on that, I was told I could do the whole transformation thing and the API that's in C# and Azure, it'll be more streamlined that way.

**Wesley Donaldson | 07:33**
Okay.

**jeremy.campeau@llsa.com | 07:36**
So based on what Antonio gave me, we can just push that event or whatever, all that data just as is, including the car item IDs to the event grid.
Then in the event grid, we can just transform everything all at once. So we don't have to worry about things breaking in multiple spots. So I'm just working through that now.

**Wesley Donaldson | 07:57**
Okay, perfect.

**jeremy.campeau@llsa.com | 07:57**
Lance set up the ECOM three so no blockers.

**Wesley Donaldson | 08:03**
Could you make a favor, please? Can you just update the ticket to reflect what the conversation you had with Jennifer and the correction there? I'm aligned generally and ECOM three basically is this layer here.
Sorry, I don't want to go too much in detail. It's basically this layer here. So ECOM three sits here basically is this. But if you could just update the tickets so we have that reflected...

**jeremy.campeau@llsa.com | 08:24**
Okay. Like upgrade, update that or in a comment.

**Wesley Donaldson | 08:27**
Just update. Feel free to update.
Maybe just update the technical notes. Then I'll come back and I'll just after...

**jeremy.campeau@llsa.com | 08:32**
Okay, alright, sounds good.

**Wesley Donaldson | 08:36**
Thank you. And you said no blockers. So you're. You're tucked in and you're good to go. Jiffco. Over to you.

**jeremy.campeau@llsa.com | 08:44**
Tim.

**Speaker 5 | 08:45**
Good morning, happy Wednesday. So later yesterday I was able to complete and successfully test the infrastructure for the Google Web hook the Newstax in case, alarms dead letter QSQS et cetera. The challenge was really how to test it without GitHub actions because the only way to get it to appear in GitHub actions went much to Maine that was able to do it outside from my local everything was green. That means deployed successfully.
Then there is destroy stack on closing of the PR environment that worked as expected. Thank you very much for the reviews to Don. This later in I was able to merge it. So now we have a new GitHub action there that allows us to deploy to PR environments as well as to dev environments. The action needs to be triggered manually, and you can select a branch from which to deploy if you deploy. Main, it always goes to Main.
Sorry for the... That way, I think I'm no longer blocking LANs or anyone doing development in this stack. If you guys have any questions, feel free to reach out. The only other thing I would say is that there is currently no production automation to deploy to production. We probably need to discuss whether we would like to set up blue-green there or make it simpler. I would recommend blue-green as it's our currently established pattern, but I heard some concerns, so maybe it's a topic for discussion. Then to the next ticket, I'm looking at how to implement the domain pipeline in central.
As for the CDK, it's already instrumented. I'll spend some more time on this ticket. Wesley, real... I think this either needs to be done after all the pieces are in place and then we can add the instrumentation, or as we're building each piece, before having the actual infrastructure and the other pieces... There is nothing to add the instrumentation to.

**Wesley Donaldson | 10:54**
Yeah, I think my thinking here is to spend the time getting ahead of it for this ticket. This shouldn't be your primary thing you're working on, but just connecting with you. All this was a task from yesterday, understanding what Rinor and Germany are doing.
Then we can use that to inform what the actual checklist items are. Update the AC as part of this ticket that would be my... I want to get ahead of it, so my concern is I don't want to wait until we have all the things actually working.

**Speaker 5 | 11:19**
That sounds good.

**Wesley Donaldson | 11:20**
In lieu of that, I did pass over the manual coupon entry over to you, Jeremy and Rinor.
Most likely, Jeremy would be a good fit to pair with to understand where we are just to inform your implementation. But that should be your next ticket. This one right here for 73 is minor.
It's a lower priority, but I'd still like to get it completed for production launch. But this is a large bit of functionality. Focus on that and then we can tackle the CCA styling concern.

**Speaker 5 | 11:49**
Okay, don't we? Aren't we getting very close to stepping on each other's toes again? Or maybe even doing it with a coupon? Sounds good.

**Wesley Donaldson | 11:57**
No. I don't think so. But we... Again, let's pair offline. I want to get through everyone else's... Over to you.

**Speaker 5 | 12:02**
Thank you.

**lance.fallon@llsa.com | 12:07**
Yeah, I'm... In JFF case changes this morning, so I'm moving my lamb into the app that he has created and just making sure everything is hopped up correctly. So I should have a PR for that one. Next within the hour.
Then to the ECOM 3, the re...

**Wesley Donaldson | 12:33**
So that sounds like Jeremy's actually tackling that. So maybe I'll leave this sign to you, but maybe three of us are paying offline. It sounds like, per his conversation with Jennifer, that this is the ticket that addresses the ECOM 3.

**lance.fallon@llsa.com | 12:49**
Yeah, I mean, yeah, there's... If he's going to tackle the pieces related to, I guess, infrastructure as well, that's fine. So I thought that ticket was mainly around the existence of the API itself, not necessarily functioning.

**Wesley Donaldson | 13:07**
So did I, but it's not like there's an additional conversation that happened yesterday.

**Yoelvis | 13:09**
But...

**Wesley Donaldson | 13:11**
Apologies. Let's table...
That's a few items that are building up here. But we can connect offline. I want to make sure I catch everyone before... You're Elvis. Do you think you are the last one?

**Yoelvis | 13:26**
Hey, I did an approach for the 749 recorder account ID you're using. But after yesterday's meeting with Rinor and some comments from... Are not completely clear. So I'm going to talk to Rinor to clarify some ideas about my approach and what we actually want.
But for now, I just...

**Michal Kawka | 13:54**
I have...

**Yoelvis | 13:54**
The code. But I put that post for now, and I am going to focus on the rest of the tickets to see if I can get them done between today and tomorrow.

**Wesley Donaldson | 13:58**
Okay.

**Yoelvis | 14:08**
Yeah, that's pretty much it.

**Wesley Donaldson | 14:10**
If I can ask you to help with the PR review as well. It's really good for you in your role just to understand all those things. You've been already doing a great job with that, but just help push PR reviews through.
If I could ask you to do that...

**Yoelvis | 14:22**
Yeah. I've been reviewing almost every PR, so feel free to send me PRs, guys. I'm here for that.

**Wesley Donaldson | 14:28**
Perfect. Okay, we have about a minute left. Sorry about cutting you off there, Girland. But my understanding, Jeremy, is that this is what you and Jennifer discussed. Can you just speak a little bit more? There were two tickets relative to this. One was setting up the Krisp environments, the event bridge, and event grid. Francis has that... This one specifically was just literally cloning and then making updates relative to inject getting content out of Thrive so out of current and push it into that event bridge.
So if that's what you're working on, Jeremy, that is this ticket.

**jeremy.campeau@llsa.com | 15:08**
Yeah. I'm changing the guts of the API to match stuff coming from Corel. Since the other one was to map the Corel to shop a 5, it's just mapping it in the whatever you want to call it, the e-com API. But to Lance's point, there's still stuff like the pipelines that deploy and to Devon's stuff that still need to be addressed.
I don't know if...

**lance.fallon@llsa.com | 15:33**
The pipelines are done, the releases are done, but I haven't actually tested that yet. I don't know if we're going to need things like URLs or certificates set up for the new API, but that might be infrastructure.
So after the two tickets are conflated, one is logic.

**Wesley Donaldson | 15:53**
Okay, so...

**lance.fallon@llsa.com | 15:55**
One is part of the infrastructure around the API site.

**Wesley Donaldson | 16:02**
Yeah, I think this ticket was what was meant to cover much of that infrastructure around it. So it sounds like we have, as you said, inflated a bit. So maybe this needs to be updated to reflect some build if it's missing anything specific for build. Francis has that on his radar, so I'll connect with him and just maybe the three or four of us can compare and just figure out what is the overlap between them.
But the most important thing I'm hearing here is that this is work already in progress. Jeremy, you're working on this so it doesn't need to be attacked by Lance. Does that make sense?

**lance.fallon@llsa.com | 16:41**
Yes.

**Wesley Donaldson | 16:43**
Okay, yeah, sorry, I think we still need fifteen minutes to clear that up, but I think for right now, to keep us going for the next couple of hours, you guys should be tucked in.
That's you have the land that you're working on. Germany, you're working on the mapping and ecom together. So I think folks should be good. Let's connect this afternoon and you're all...

**lance.fallon@llsa.com | 17:04**
Sounds good.

**Wesley Donaldson | 17:06**
One last thing. We have the second rock.
If we had two more tickets that we wanted to share with the product, what was it? Four and five? I think it was... Yeah. These two guys. I assume we're still good to go for that.

**lance.fallon@llsa.com | 17:17**
I have a good one.

**Wesley Donaldson | 17:18**
Thanks. Okay, guys, thank you so much. I apologize I didn't get a chance to share this with you, but I will make a point of making sure we get to it in tomorrow's status.
So far, it's looking really good. Good job, team. All right. Guys, talk to you later.

