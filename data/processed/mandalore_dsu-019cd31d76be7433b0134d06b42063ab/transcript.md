# Mandalore DSU - Mar, 09

# Transcript
**Wesley Donaldson | 00:56**
Good morning, all. Beth, welcome back from holiday. Hope you had a great time.

**bethany.duffy@llsa.com | 01:05**
I got my flooring done. So I'll call that a win.

**Wesley Donaldson | 01:09**
That is a win.
So while I wait for everyone else to join Beth, I can do a top line of what we are prioritizing for the week just really quickly. We had... Per the direction that we got from Greg and I assume from you as well last week was this idea of just cleaning up all of the US concerns or creative concerns that we have outstanding. Anything that we have left over from the MC MVP bill, let's try to just knock those off for this week while we wait for you to have a little bit of space to go through and get us additional features from the PRT 2 or pity 3.
So that top line is the first priority for the week, and the other priority for the week or major priority for the week is just to start getting ahead of the order ingestion. This is mostly an engineering epic and just engineering work generally, but just getting ahead of starting to build out the backend system for ingesting recurring order information into our thrive system. Who more than thrive into current into to thrive into C star. We have some smaller stuff, but generally those are the two critical priorities for the week.

**bethany.duffy@llsa.com | 02:23**
Got it. Are we prioritizing observability and monitoring? Or is that kind of...

**Antônio Falcão Jr | 02:30**
Next.

**Wesley Donaldson | 02:31**
So that is built into the order epics. We have one that deals with pre-the order being placed. So there's a small bunch of TI tickets that are outstanding for just getting, reviewing the current implementation of entry and pulling in anything we need to give us order validity. Observability before the order is placed button is clicked, but after the button is clicked, everything beyond that point is built into each epic. That's a core deliverable as well, right guys?

**bethany.duffy@llsa.com | 03:01**
Got it.

**Wesley Donaldson | 03:04**
Let's jump in. I'm going to go folks by folks, just...
Then as we start going through the priorities, I'll switch back to just focusing more around priority level as opposed to individual levels. So let's start with you, Antonio.

**Antônio Falcão Jr | 03:19**
Yeah, cool. Disney review is not about architectural level review. I directed with Sam to take that moving and... It's the... Patterns to the online store.

**Wesley Donaldson | 03:37**
The goal for that is we didn't review that as a team at the Indian architecture meeting.

**Antônio Falcão Jr | 03:42**
I'm sorry.

**Wesley Donaldson | 03:44**
The goal for that is we're looking to have this completed and pushed and done as part of review in the architecture meeting this week tomorrow.

**Antônio Falcão Jr | 03:51**
That's correct. Yeah, that's correct.

**Wesley Donaldson | 03:52**
Okay, cool.

**Antônio Falcão Jr | 03:55**
Then proxy one. Yeah, I still... It's not working... Proxy yet I still testing it. So...

**Wesley Donaldson | 04:03**
Well, good. Any blockers? You're good to go. Do you have a perspective of when you think this could be completed since this is part of the commerce? This is in my mind, it is part of NBP honestly. But your thoughts on... Is it something that's for this week or targeting later this week?

**Antônio Falcão Jr | 04:15**
It is.

**Wesley Donaldson | 04:19**
Later next week.

**Antônio Falcão Jr | 04:20**
No, absolutely. This week I only see as not a blocker but a dependency because I will have to make some small changes to the DNS definitions and for that I may need some... Or member team to help me move with that, but I'll keep you or Jennifer posted if I need a ticket to make that go faster.

**Wesley Donaldson | 04:42**
Sounds good, we can skip... Krisp, I'm not sure what's on that... That's fine, nothing's on him. Devon, do you want to go quickly? There should be nothing on your plate.

**Speaker 4 | 04:57**
Yeah, nothing on my plate. But Beth, if you'd have some time today, maybe I'd like to get together just to make sure I got all of those defects fixed.

**Wesley Donaldson | 05:10**
Okay. Yeah, and that's ticket number 666 again. If you need to get a list of all of them...
Jeremy over to you.

**jeremy.campeau@llsa.com | 05:28**
Good morning. I have the work done for the ticket, but there's a bunch of. Not a bunch. There's some issues with the playwright test, so I'm trying to make sure they all work again. But, yeah, hopefully I can get something up to date for that.

**Wesley Donaldson | 05:48**
Okay, and you're clear on the next couple of things you can grab? I sent you one from one of the defects that Devon opened around the checkout flow.
So that's that aligns with the priorative cleaning of all MVP stuff.

**jeremy.campeau@llsa.com | 06:02**
Okay, yeah, I'll pick those up after I get a PR up.

**Wesley Donaldson | 06:07**
Maybe sync with Beth on this one. I think we've gone back and forth on this a couple of times, just making this truly real.
I think we've... The pseudo approach right now is what's there. But if this needs to be based off the recurrently invoice number and some other maybe prefix text to it, and maybe we're just syncing with her just to get a perspective of what the file output should be for this.

**jeremy.campeau@llsa.com | 06:27**
Sounds good.

**Wesley Donaldson | 06:29**
Cool.
That actually works really well to hand off to your Elvis and to yephead.

**jeremy.campeau@llsa.com | 06:34**
So swinging back to that last one, I don't know if we want to get into the weeds, but it sounds like we're going to show them an order number that in the future will not show in any other system. Is that an issue?

**bethany.duffy@llsa.com | 06:54**
I wanted to be whatever number is populated on the recurring receipt that they get so they know what to look for in their inbox. So I will just need to see what we're currently sending and then we can make sure it matches that.

**Wesley Donaldson | 07:15**
Okay, excellent. You of us... I had called you out only because the conversation around how we should run the playwright tests that's related to what Jeremy just said... I have that on your plate just to put some thinking into.
I know we like it if we want to pull this into architecture, that's fine, but a bigger conversation around how we are using these playwright tests now that we have them created? Other than that, if you want to give your status... Are you here? You are not here.
That's fine, I'll sing back with him. No big deal. So let's go to...

**jeremy.campeau@llsa.com | 07:56**
Okay. There's one item in review for the loading map indicator, and then there's one in paused related to some of the map behavior. I talked with Elvis last week and there are some quirks in the map with the map in general.
Then we add a number of questions for how we actually want the map to just display in general the various scenarios. And he was unsure and I was unsure. So we thought we needed to take this one back to product to see what their thoughts were and what they're actually expecting here.

**Wesley Donaldson | 08:36**
Perfect.

**bethany.duffy@llsa.com | 08:36**
Okay, let's talk about this one in our product office hours today and run through any questions you guys have.

**jeremy.campeau@llsa.com | 08:50**
I mean, that guy's kind of been floating around, before the, you know, realized stuff kind of going fast at the end of last week, but I'm swinging back to this guy.
Do you have a document kind of laying out some of the options we have?
I know theus has an idea of how we can handle it, but.

**Wesley Donaldson | 09:08**
So can I is it reasonable for you to be able to share that document or your perspective for like around one o'clock 1230 in that range? The meeting that I mentioned this morning of just getting us to sit back, take a breath, and think about the outstanding questions or uncertainties around commerce.

**jeremy.campeau@llsa.com | 09:29**
Yeah, I mean, it's very specific to just how we're handling a child and parent relationship. Doesn't get much deeper than that. But. Yeah. I mean, II can speak to what I'm what I've found here.

**Wesley Donaldson | 09:46**
Okay, let's do it in the meeting. If you can just add your PayPal or your document that you're working on to this sticky note. Add it inside the body of the ticket. Not as common, please.
Okay, Meha, over to you...

**Michal Kawka | 10:04**
Hi, everyone. So, in terms of the parked events alerting, it's ready for review, so it would be nice if someone could take a look at that. I think the sooner we merge it, the better. That's a quick PR there's only 100 lines of code, so that's not a big deal. Once we merge it, we can check if the dashboard and the alerts are in place.
If there's something wrong, of course I'll...

**Wesley Donaldson | 10:26**
I'm sorry, can I ask you to connect with Joel specifically? I want to make sure he's fully aware of all the events and how we're managing alerts in the system. So I'd like for him to start being more of the main reviewer for this. You can peer with Antonio as well, but definitely make sure he sees this and shares a perspective on it.

**Michal Kawka | 10:46**
Sum, in terms of the resolution.

**Wesley Donaldson | 10:49**
Okay? Sorry, go on...

**Michal Kawka | 10:53**
I replayed all the events for the PDF mailer. There are still some other events to be replayed, for example, iterable events and the spot events. I'm going to sync up with Harry and ask him which ones should be replayed because some of them can have side effects.
So for example, we don't want to replay the event story terrible. That would trigger the event notifications that would be one month old. So we need to be more careful with them. I'll... I basically talk to Harry and I ask him which ones should be replayed in terms of the alert alerting assessment. I'm folding up a document which I will share with some other developer to review, just like the ticket says.
So I identified a few gaps that need to be fixed. In general, we're in a good spot with observability. Once we merge the PR about parked events alerting, it's going to be even better. But there are a few things that would benefit from improvement.
So I'll put up a document and forward it to any volunteer. So I guess it's going to be you as well.

**Wesley Donaldson | 11:59**
Yeah, could you add me to that one, please?

**Michal Kawka | 12:02**
Sure thing. Yeah.

**Wesley Donaldson | 12:07**
Okay, so how many do you know? Do you have a sense of how many events are outstanding on this?

**Michal Kawka | 12:14**
So in terms of the PDF mailer events, I replayed 12 of 12,000, but there are other streams, right?

**Wesley Donaldson | 12:20**
Okay?

**Michal Kawka | 12:22**
So there are, for example, spot events, iterable events, and participants. There are those participant Aurora events.
So we need to discuss which ones we need to be replaced because PDF mailer had no side effects, right? So it doesn't trigger any notifications or user-facing stuff. But since it's terrible events, they are user-facing, we need to double-check which ones we want to replay because if we trigger ratification for results that are two months old, it's going to make us look not good from the customer perspective.
So I'm going to have to talk to Harry about how we're going to approach the other events. But PDF mailer events were fully replayed with no issues.

**Wesley Donaldson | 13:08**
Understood, right? Sounds good. Jeff, cover what you three?

**Speaker 8 | 13:15**
Good morning, Tim. So as we just talked on the previous call, I'm starting today on these new tickets. I actually reviewed 6906, but maybe I should switch to 312 first. But well, I should review all of them for the engineering.

**Wesley Donaldson | 13:35**
So sorry about that. I can help you with that. So this is a lower priority. I can lower that for us. So this is, as I said, one of those outstanding things that we just need to clean up.
But these are the critical... These are the first priorities of closing out everything from MVP but then that...

**Speaker 8 | 13:53**
Okay, great. Then I started that actually, I guess. So I'm reviewing 696. I'm just seeing that there are issues. Yes, please. Thank you. There are issues. There are mentioned both on the appointment as well as packages in the review pages, but just noting it here.
I will be taking care of the appointment page as well, so I'm noting it here so we don't step on each other's toes, so to speak.

**Wesley Donaldson | 14:18**
Thank you. Perfect. Sorry, this one. I feel like we've already pushed us to the demo.

**Speaker 8 | 14:19**
Yeah, we'll come back with questions, if any.

**Wesley Donaldson | 14:26**
Do we...? Can this be closed or are you waiting...? You say you're waiting on a review, so it's merged, yeah.

**Speaker 8 | 14:30**
No, much.

**Wesley Donaldson | 14:33**
Okay, so we can close this one then.

**Speaker 8 | 14:35**
Yes, please.

**Wesley Donaldson | 14:36**
Okay, CO who did I miss?

**Speaker 8 | 14:37**
That's complete.

**Wesley Donaldson | 14:42**
I think I got everyone. Okay, anyone unclear or blocked? Anyone unclear what their next task is or is currently blocked on a task that is priority and they need support and unlock?
All right, folks, I always have a meeting to get together to talk about orders for about an hour or so. Other than that, stay focused on your priorities and we will reconvene this part of engineering refinement just so we have more transparency for the larger team.
Generally, what we talked about this morning will remain in effect. Thank you guys so much. Bye for now.

**Michal Kawka | 15:21**
Thank you. Good bye. Bye. Thank you.

