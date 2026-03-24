# Mandalore DSU - Mar, 23

# Transcript
**jeremy.campeau@llsa.com | 00:06**
Today was the Happy Monday happy.

**Wesley Donaldson | 00:08**
Good morning. Happy Monday. [Laughter] I think it's important to keep it positive on a Monday morning, so even if you're not super energetic, you got to put that energy out to get it back.

**jeremy.campeau@llsa.com | 00:19**
That's true, right? Well, I feel like Tuesday is really the toughest day because Monday you're half awake. You're still in weekend mode a little, but then Tuesday, it's like... Nope. The real work. Weeks here.

**Wesley Donaldson | 00:33**
Yeah, what does it say? Wednesday and Thursday are the most productive days, but productive...

**jeremy.campeau@llsa.com | 00:38**
Yeah.

**Wesley Donaldson | 00:40**
Let me share my screen.
Try to share my screen. All right, let me know when you guys can see that.

**jeremy.campeau@llsa.com | 01:01**
We can see it.

**Wesley Donaldson | 01:02**
Excellent. I got six folks. Ski folks. A couple more minutes. Antonio. Good to see you can join.
Alright. I think we have enough for a quorum. Let's jump in. Then we can come back to folks who join late. Let's start with Antonio.

**Antônio Falcão Jr | 01:37**
Guys. Good morning. No great news on this one. You can update, please. I have one in progress.

**Wesley Donaldson | 01:44**
One.

**Antônio Falcão Jr | 01:44**
This one in progress, I just started working on it. No great news on this one, but I have a few done, but thank you. Those are specific to the N20 suite. Test took over the full integration between recurly, LLMAs, webhooks, and projection.
So it's in place already. It's manual, we can run it manually. Very specific branch and it pretty much uses SDKs recurring SDK to create a purchase and make some subscription chains membership chains.
Then as we implemented it, it does consume the application and makes the hydration. And we do consume those domain events via a projection connector. Then we check the projection.
So it is what pretty much this test does. It does provoke in the very beginning via SDK and then consume the very ending via projections to make sure that the integration worked.

**Wesley Donaldson | 02:57**
And that's nice, that's great work. This is... Testing is how we prove the full system is working. So a great job on that. I think I'd ask you just maybe prepare a two-minute walkthrough of how to trigger this for our call later this afternoon.

**francis.pena@llsa.com | 03:12**
Yes, absolutely.

**Wesley Donaldson | 03:13**
One thing relevant to that is...
I think we still are not clear as to how to validate SQs to DLQs. How do we actually trigger? We had some thoughts about changing out the contract and training out the endpoint, but that is still one area we need to come up with a test plan for. Let's keep going. Francis, over to you.

**francis.pena@llsa.com | 03:40**
Alright, so I have a few things here. The actual event grid is ready. I configure the secrets in GitHub. And. And as I guess we can move that to complete it.
That one.

**Wesley Donaldson | 03:56**
Okay.

**francis.pena@llsa.com | 03:56**
The other two are for the ANT. I provided information there.
So this is set up that we try the queue and the alert.

**Wesley Donaldson | 04:07**
So these are already perfect.

**francis.pena@llsa.com | 04:08**
It's the same exact. Yeah, it's the same exact implementation we did for TBS, so that's the way it works. Yeah.

**Wesley Donaldson | 04:17**
I'm going to leave them in review. Can I ask you just to connect with Jeremy if you have a chance to take a look at his tickets and in review and to make sure you're aligned with them? I assume they're basic.
I saw your comment on this one as well. Do you want to just give a quick status on it?

**francis.pena@llsa.com | 04:35**
So for that, we'll need a new ticket to implement it. But it's just a research policy for the APS that STRI Security has provided. So it will be simple to...

**Wesley Donaldson | 04:46**
Right. So I owe you a ticket to marry. To marry 777.

**francis.pena@llsa.com | 04:51**
Yeah, and to implement it.
Yeah, I mean for the actual implementation because this was just reviewing it and this...

**Wesley Donaldson | 04:57**
Okay. And then 775.

**francis.pena@llsa.com | 05:01**
I think we agree that I don't need to worry about the custom domains that we'll need and the certificates. Everything is there already.
It's just the setting up the cost in domains for production and actually for dev. Have we decided on the name that we're going to give to the API endpoint like recurrly API that lifelong assembles dot com or whatever? What is it that we're going to...? Or is that a decision that maybe we can make?

**Wesley Donaldson | 05:29**
I think that's you could I think you could make the decision based on what we've done for other similar endpoints, there is no a hard requirement for them.

**francis.pena@llsa.com | 05:31**
An me.

**Wesley Donaldson | 05:38**
I would encourage just putting recurrly as part of the name so we can easily identify it.

**francis.pena@llsa.com | 05:42**
Okay, so maybe API recorded at lifelongscreening.com and for production lifelongscreening.com. Okay, I'll put that in the ticket and I'll proceed with that. This part for me, I think...
Sorry.

**Antônio Falcão Jr | 05:56**
Aheadman, sorry.

**francis.pena@llsa.com | 05:58**
No, I think this ticket was going to be split into two parts. The other part will be deploying the environment to production. Now we discussed that this is the same as what is done for dev right now.

**Wesley Donaldson | 06:10**
Yeah, I think that's what you want to speak to.

**Antônio Falcão Jr | 06:10**
So it's...

**Speaker 5 | 06:11**
Just...

**francis.pena@llsa.com | 06:12**
It's okay.

**Wesley Donaldson | 06:12**
And you go ahead.

**Antônio Falcão Jr | 06:16**
I was asking... I was about to ask Francis if he's going to make any change in the DNS sandbox today about this specifically to let me know because we have a presentation in a few hours. So if I'm mistaken if we change...
If we switch legs or we change NS, we need to reconfigure in the recursive sandbox repo to the new one. So it's going to break my demo. So just let me know if you'll make any change on that.

**francis.pena@llsa.com | 06:45**
Okay? I'll let you know, but the changes are just adding the custom domains. So the whatever the current domain given by DNS sandbox that's gonna stay there. You're gonna have another custom domain.

**Antônio Falcão Jr | 06:57**
That makes sense. Yeah, that will not... Okay, it's so you can reach... Yeah, the older one... Yeah, exactly.

**Wesley Donaldson | 07:06**
Antonio, can you post in the general channel or just the end channel if you're concerned about...
If there's a leg switch or anything happening, just to make sure they're aware that we need them to hold off on that.

**Antônio Falcão Jr | 07:17**
Let me do that. No problem.

**jeremy.campeau@llsa.com | 07:18**
Yeah, sure, I think Harry did one this morning. I don't know if that'll impact what you did, Antonio.

**Antônio Falcão Jr | 07:27**
I did check already. No impact. Thank you for letting me know.

**Wesley Donaldson | 07:32**
All right. Jeremy, over to you.

**jeremy.campeau@llsa.com | 07:36**
Yeah, I'm working through it. I'm still having some issues with the Krisp order isn't zeroing out, but I'm able to get all the orders to push into Krisp, so I'm just working through that right now. Beth, I sent you a question.
You get a chance, you can just get to it. That's really it.

**Wesley Donaldson | 07:57**
Can we close out? Tick get 7:56. It sounds like the work is really on the ECOM 3 the API itself. This is just more of the investigation and planning. Are you comfortable just closing this one out?

**jeremy.campeau@llsa.com | 08:12**
Can you open it? I just want to make sure I understand which one that is.

**Wesley Donaldson | 08:16**
This is a field mapping.

**jeremy.campeau@llsa.com | 08:20**
Okay. Yeah, I believe we did that one. Yeah.

**Wesley Donaldson | 08:23**
Okay, and this one already... This contains both the API as well as the Lambdas on LLaMA. Okay, sounds good. Just what are your thoughts on projecting forward? We're targeting end of day or Wednesday rather as the day to have all this together for us to start reviewing and finding any concerns. Is that still reasonable? Do you think there's a lot of investigation and tweaking still remaining on this?

**jeremy.campeau@llsa.com | 08:52**
I think it is possible that I will be able to have something that will insert orders, but it might not be completely accurate. So, like you said, if it's just for end testing, saying, "Okay, now we got an order that we made in recurring."
It's getting in. It might get the order into the CSTAR database, but it might not be completely correct. So if that's what you're saying is the goal, then that's possible, I think.

**Wesley Donaldson | 09:19**
Yes.

**jeremy.campeau@llsa.com | 09:23**
Yeah, based on what I know so far.

**Wesley Donaldson | 09:27**
That's good. I think my worry is just going to be we probably want to have another... Antonio will share a show what he did for the end testing.
But he has a good mechanism for proving that the orders look correctly when from the projection side. So we know what's coming in, we know what's going on, and we can prove them. It sounds like we need something similar on the CSTAR side as well. Jeremy, that way we can confirm if there are indeed gaps or missing or DA doesn't look right. It almost feels like we need some process to be able to verify those orders.

**jeremy.campeau@llsa.com | 09:58**
Yeah, I agree.

**Antônio Falcão Jr | 10:01**
Let me just extend the existing one to cover that part as well.
I don't know.

**jeremy.campeau@llsa.com | 10:08**
Yeah. So one of the constraints with working with the Econ 3 API is that there's only one section that we're focused on changing because of the way that we're using an e-com. We're using another e-com API, and what we do shop was built on top of it, and so we're doing the same thing with recurly.
So there are some things that are constrained by... I guess is the right way to say it. So I can think about what we could do to test that. There are some interesting side effects of certain things.
So it's super hard to be like, "Okay, we can just write a test or something that just fetches the data from the database and matches it." There are stored procedures that run and other things that are in the scope of the recurly API, so it's not as straightforward as it might seem.

**Wesley Donaldson | 11:06**
Yeah, let's table it for this afternoon. I think let's go deeper and figure out what we can do to accomplish the goal.
Maybe it's not perfect, but let's table it for this afternoon. But you're still heads-down on this with you clear what the target is. These two we're taking from you. We're going to try to attack these as part of the one-hour working session today with you, all of us, and Jiffco.
So you can ignore those. Speaking of Jiffco, great transition.

**Speaker 6 | 11:33**
Sorry, just one second. Jeremy, did we decide that the questions you had around balancing the order and CR were we're going to come to product office hours so we could talk through that?

**jeremy.campeau@llsa.com | 11:42**
Yeah, I'll... Forget about that. I can show up there.

**Speaker 6 | 11:46**
Okay? Yeah, I just have... There are always nuances, so I want to talk through those.

**jeremy.campeau@llsa.com | 11:50**
Sounds good.

**Wesley Donaldson | 11:51**
Perfect. Okay. Jessic, go.

**Speaker 5 | 11:57**
Eighteen. Well, I guess the television wasn't that great, but it is you, TED, and I feel it anyway. So on my tickets...

**Wesley Donaldson | 12:05**
[Laughter].

**Speaker 5 | 12:06**
Thank you very much, Antonio, for the quick review this morning. I was able to schedule it for March. That 763 and move the ticket for ready to port coupon entry. I just did the PR for that, but I don't feel it's ready for review on it.

**Wesley Donaldson | 12:22**
Dep.

**Speaker 5 | 12:27**
I would like to reiterate a bit more while it's on the peer environment, however... Wesley, as we talked, we would like to focus first on the CDK for production recovery.
So the CDK recovery for production. This is what I switched my attention to today. That is ticket 780 and I saw your comment. Yes, I'll be able to come later to this call today. So Francis will likely have to reach out to you to create those subdomains there.
I have a little discussion if you have a moment today. Thank you. At this time, no impairments, I think. Just need to communicate more with you guys and assure that what we're going to build for the city is actually what we need and going to use moving forward.
That's it.

**Wesley Donaldson | 13:26**
May I suggest a quick peer session? You, Francis, and Antonio, feel free to include me, but I'm busy. Probably busy for the next hour, so... But each person is working on some element of the CD environment.
Francis, it looks like you probably have the domain set up and such. If I can get three of you just to be in a one-shared conversation just to clarify your tickets relative to the overall goal of getting the environments stable and solid for this week.

**Speaker 5 | 13:56**
Yeah, that makes sense. And I'll create the sync chart with us. Yeah, and we can discuss it here, thank you.

**Wesley Donaldson | 14:01**
For this one, do you feel this PR could be ready for review and end of date today?

**Speaker 5 | 14:09**
I'll try. It seems doable right now. It depends on how much time we get with the... But yes. In one important note, again, I'd like to state again, tomorrow I'll be on jury duty. I'm not sure how long it will take. It will be my first one too, so just giving you advanced warning, if you will.

**Wesley Donaldson | 14:27**
Thank you. All right, LANs to you.

**lance.fallon@llsa.com | 14:33**
Hey. I picked up the one that's in progress on Friday. They're just setting up the connector and the LLaMA that we'll send to the event cord.

**Wesley Donaldson | 14:43**
The...

**lance.fallon@llsa.com | 14:46**
Francis, thank you for setting those environment variables and secrets up.
So have no blockers or should have something? Hopefully today, if not early tomorrow.

**Wesley Donaldson | 15:01**
Perfect. We have a small ticket for the spreadsheet that you, the customer service team, use and just take a quick read through this. Just make sure we're clear on what the need is.
It's just something that from your past experience... Let me know if we need any more if we need to bring it to product AP dev to connect with Beth... In the last couple of minutes.

**Michal Kawka | 15:29**
Hi everyone. I picked up the help chat icon. I already started a chat with Beth and Rob so we're discussing it. It's in progress. I'm looking at the two tickets that are below, so they are likely resolved by my previous actions, but I need to double-check in terms of my today's task. I fixed smoke tests because one PR but that was merged by the Ander team last week broke them so it was already merged. We'll see if the tests pass now.
If not, I'll take further action. I'll try to merge my in-review tickets later today. I closed a couple of tickets and moved them to done, so that's basically my update because we are already over time.

**Wesley Donaldson | 16:20**
Sounds good. You, Elvis, I don't think you have anything urgently on the board we talked about. Yeah, anything else? Anything that you're blocked on, or any questions you have?

**Michal Kawka | 16:34**
No, I'm good.

**Wesley Donaldson | 16:35**
Okay, cool. All right, guys. Thank you all so much. Again, for those who are in the product app dev sync, we have a couple of folks JFFCO. Me, how you should be joining that? The goal for that is to get some additional smaller tickets from the product team.
Jeremy, you have a conversation that we want to have in that DEP sync as well. So I'll see you guys there. Again, for the meeting this afternoon. Please just come to that conversation ready to speak to where we are with the overall integration. Any questions, blockers, or concerns you have? Thank you guys so much.

**Michal Kawka | 17:08**
Thank you.

**Wesley Donaldson | 17:08**
Thank you, Gus.

**Michal Kawka | 17:08**
To feel a day. Thank you.

