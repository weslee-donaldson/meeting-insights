# Mandalore DSU - Mar, 16

# Transcript
**Wesley Donaldson | 00:03**
Test. Test. Test. Good
morning, all.

**jeremy.campeau@llsa.com | 00:59**
Good morning. Morning.

**Wesley Donaldson | 01:08**
Let's give folks a couple more minutes. Welcome to a beautiful new week. I say beautiful because it's comical that in Atlanta, it was 75 yesterday and it will be 29 tonight.

**jeremy.campeau@llsa.com | 01:30**
That's quite the change.

**Wesley Donaldson | 01:31**
We literally had to go in the closets and get all the winter coats out this morning like a premature... I'm going to jump in and get started. We can touch on additional folks in the order they show up.
So... Meha, let's start with you since you are here.

**Michal Kawka | 02:00**
Hi, everyone. Yeah, so, all order interpretations are ready events are still in progress. On Friday, we replayed about 2000 events, maybe a bit more. We decided to pause for now to see what's the response from the call center.
So I'm ready to replay the rest of them, and I'm going to do that once I get a green light. But for now, we stopped. I'm preparing the post-mortem for the blue-green connector errors.

**Wesley Donaldson | 02:28**
I think for you, I need to confirm that with the team today.

**Michal Kawka | 02:31**
It's going to be done soon.
After this is done, I'm going to pick up something from my backlog, so I have quite a few things on my plate.

**Wesley Donaldson | 02:46**
For now, until I have that meeting with the team later on today... For now, the next one for you is going to be the leg switch.
Two weeks ago, we had an architecture meeting, and we talked about the possibility of needing to do some additional dashboarding. So this task here, as well as the spike to validate the reports and existing things inside of AWS, so these two, I would say, are your next priorities.
So start with this because it informs... It's relative to the blue-green challenges. And that's critical for us going into commerce. Then the follow-up would be the document existing dashboards and reports in AWS right because this tells us what exists in blue-green, what we are currently should be able to monitor, and what observability we currently have full transparency. This may all get prioritized in favor of some other customer-facing features, but for now, that's your next priority. I'm hoping this will be a quick win if it's not more
than a couple of hours. Please let me know. This may get abandoned because you already have a rough document for this. That may just be enough.

**Michal Kawka | 03:49**
Sure thing. Yeah, I'm just going to wrap it up. I had quite a detailed explanation of every error. So I need to consolidate it into one document. I'll most likely share it with you for a preliminary assessment, and then we can share it with the team.
Maybe we'll schedule a meeting to basically discuss all those issues that we had last month because I think a normal post-mortem session would be beneficial for us.

**Wesley Donaldson | 04:16**
Agreed. Okay, so you're good. Antônio, you're here. Let's do to...

**Antônio Falcão Jr | 04:25**
Okay, guys, on my side, I have this ready for deployment. I'm starting to run in this morning. I need to just... Yeah, it's reviewed. It's good to be deployed. So... The Emmett one... Mihao is reviewing the code for you right now, so as soon as you can... We appreciate that.

**Wesley Donaldson | 04:51**
If you can cor me how like we this needs to be presented tomorrow, so let's give like Antonio his feedback so we can have at least a couple hours to just kind of respond to any feedback and get his thoughts together before presenting tomorrow.

**Antônio Falcão Jr | 04:52**
And...

**Michal Kawka | 05:06**
A va. Yeah.

**Antônio Falcão Jr | 05:09**
Okay. Just after those ones, I will start working on the 757, which is the CL plus hydration component from the recurring work.

**Wesley Donaldson | 05:20**
Great, you gave me you did your timeboxing on this.

**Antônio Falcão Jr | 05:21**
Yeah.

**Wesley Donaldson | 05:24**
Thank you. I think the only thing I was missing was just a rough comment on what we want to attack for this or if it's...
I think your perspective was it looked good, but it was not complete, so just give me a comment on it, and then we can call this one done, and I could take it.

**Antônio Falcão Jr | 05:39**
Surfing. Yep.

**Wesley Donaldson | 05:40**
Cool. Let's keep going. Jeremy, to you.

**jeremy.campeau@llsa.com | 05:54**
Good morning. So I'm almost done with my ticket in progress. The one I sent you a message about it, but there's an issue trying to build on the PR environments. I noticed it's happening with mine and two other tickets that are both from three or four days ago.
So the one that's having the issue is 705. So that's blocking it from being merged. I still need to get it reviewed, I believe. But that's going to block it from merging today. I know you want me to show all those things together during the session, so maybe I should...

**Wesley Donaldson | 06:32**
No, that's...

**jeremy.campeau@llsa.com | 06:36**
I mean, honestly, I think I can just message Betham, maybe meet with her later today or something. Or tomorrow. Just because of that build issue, I didn't foresee or not build the issue. The PR issue.
And, you know, they're kind of all related tickets, so showing them, like, one at a time might not really be helpful for showing, you know, them the full picture.

**Wesley Donaldson | 06:53**
Yeah. Can you demonstrate these, like, here? I'm trying to see if it's worth just showing her them in a local environment just for the sake of showing her they've been corrected.

**jeremy.campeau@llsa.com | 07:11**
Okay. Yeah. I can go and show her. Then maybe by the time the meeting happens, some of them will get resolved or whatever.

**Wesley Donaldson | 07:20**
Okay, right, let's just say that's the initial plan for now, show her.

**jeremy.campeau@llsa.com | 07:20**
Yeah, there's been a bunch of changes.

**Wesley Donaldson | 07:25**
Just show her them. They're completed in a local. I'd love for her to be PR, but I just want to get her visuals on these as soon as possible.
You say you're almost done with this one, correct?

**jeremy.campeau@llsa.com | 07:37**
So I feel like once I get those merged, all to come back and just make sure that there are no gaps just because there have been a lot of changes with checkout in the PRs I've seen and including mine.
So I do have something that's working. But I'll have to double-check it once everything's merged.

**Wesley Donaldson | 07:52**
Yes. The next one on your plate. There are a couple of things on your plate. I'll talk to you guys as a team about these. Maybe I'll just reach out to you directly, but my thinking is this is the highest priority.
This is going to significantly inform much of the downstream work around the mapping of recurring data or recurring events into what we need to actually populate or shopify order create order object.
So take a look at that. That's number one with a bullet, I think after we get through. So I'd say make best efforts to get these off our plate so you can start tackling this. Ideally, today, and then I'll talk to you guys about these in a minute.

**jeremy.campeau@llsa.com | 08:28**
Okay, sounds good.

**Wesley Donaldson | 08:33**
Last, let's go to EIX.

**lance.fallon@llsa.com | 08:38**
Okay, I'm working through the guy that's in progress. It looks like there have been some updates to the requirements. I already have the initial LLaMA setup that takes in the header and then adds it to a queue.
So I don't know if this one is almost done based on what the new requirements are, but I'll...

**Wesley Donaldson | 09:06**
Yes, the big change for this one really is just the hydration difference.

**lance.fallon@llsa.com | 09:07**
I'll have to take a closer look at what's changed.

**Wesley Donaldson | 09:13**
So now we have to send a separate Lambda. So this is very much just focused exclusively on getting the events from Rick Curley, pushing them on the queue, and that's the core of that one ticket.
Well, previously this contained it.

**lance.fallon@llsa.com | 09:24**
Okay. So I'll take out this stuff where I was writing to that role Curley event stream.

**Wesley Donaldson | 09:33**
You have actually... No, Antonio has the ticket for hydration. Maybe peer with him to see what you've already done can be carried over, just so that's not lost or if you're far enough along maybe it's just you actually own the bot tickets.

**lance.fallon@llsa.com | 09:33**
Then...
He'll be out there with him, see what he wants to do.

**Wesley Donaldson | 09:57**
Perfect. Don't worry about these. We can talk about them a little bit later. Let's go to...

**Speaker 6 | 10:07**
Good morning. I'm having some connectivity issues this morning here, probably because of the storm, that is all. Anyway, so, I just this morning completed 696. Thank you very much always for the approval there.
It's currently queued to March and then switching to complete 07:27. Last made a comment on it on the Lambda on Friday. I'm not sure if you would like to connect here or I can... I just heard that you probably made the LLaMA. I would like to review it again. I can move forward with it and then you can add the LLaMA to it. How would you like to proceed?
But basically on this ticket, I'm about to test and confirm that it is working properly on the pre-environment this time, no blockers.

**Wesley Donaldson | 10:56**
Yeah, I think the only thing I'm curious about is if it's if there's anything you need to do from just again from the integration.

**Speaker 6 | 11:03**
Okay, I need to see that. It seems to be updated. Yes, okay, I'll check on that part.

**Wesley Donaldson | 11:06**
Yeah, they dis pair with like exactly.

**Speaker 6 | 11:08**
Okay. Okay. Right off the standup.

**lance.fallon@llsa.com | 11:11**
We may just want to... Maybe you want to enter a new PA up?

**Wesley Donaldson | 11:15**
So I have the exact same thought, Lance. I have a thirty-minute meeting on our calendar for us to do exactly that. If you can meet before them, because I have about an hour of meetings...
If you can meet before them, great. If not, the goal for that thirty-minute session is to do exactly what you just said.

**lance.fallon@llsa.com | 11:33**
All right, now we can just start a chat after this and see if we're available beforehand.

**Wesley Donaldson | 11:37**
Okay.

**lance.fallon@llsa.com | 11:38**
Otherwise we can move then.

**Wesley Donaldson | 11:40**
Sounds good. Your Elvis over to you.

**Yoelvis | 11:47**
Hey everyone. I have been reviewing PRs today and fixing some of the conflicts. My... So one of them was merged. The other one I just pushed some updates based on the conflicts. Fixing the conflicts and working on the 749.

**jeremy.campeau@llsa.com | 12:10**
Good.

**Wesley Donaldson | 12:11**
Okay, excellent. You're working through that. Then for me, I guess the next question would be what is the next logical thing for you to take on if you have bandwidth? It, but let's pair inside of that 30-minute session. My goal for that session is just to look at this document. All of the epics exist that are aligned to this document. 1.21.1. That aligned to the of what we talked about in the state of integration on Friday. My worry just being fully transparent is the amount of runway we have and managing leadership business expectations around when we can get to what state.
Ideally, when can we get orders into CSTAR coming out of recurrently? So let's just talk about my goal for that is just to talk about who can, how can we divvy up the work to make sure we can hit that time that timeline.
If we can hit that timeline, fine, what can we do as a team? Do we need to pull additional help or do we just need to manage expectations around what we can deliver things? So that's the goal for that 30-minute session.
It's not really to solve all of our problems, but to get to an alignment on who's on first effectively. Did I miss anyone, Devon? Distribute nothing on your plate actively. Ideally, you should be getting fee requests from the individual tickets. The defect tickets to review.
All right, anyone? Sounds like everyone is clear on what their next attack items are. Anyone on clear? Anyone have a question? Jeremy. We can message in the chat about the possible PR concerns that's blocking me. Maybe it's faster for you just to... Jeremy, share the channel with me. Just be on deck to take a look at what Jeremy flags as a concern he raises. Cool. I'm not going to ask a team member to own stand up this Tuesday, Thursday this week just because it's a lot on your plate.
So let's not add one more thing to your plate. Maybe I'll hold it for this week and maybe next week we can really bring that back up. Then JFFCO, how are we on our agreement around the SRE track? It was the bit of the training session for this.
I would still like to do that this week. So just... Let me know if you are truly heads down on your tickets and then I can move it out. But I'd love to see if we can try to still fit that guy in
because observability is super important to the leadership at this point. All right. Thank you guys so much. That's it for today.

**jeremy.campeau@llsa.com | 15:00**
Thank you. Have a good one. Later, you.

