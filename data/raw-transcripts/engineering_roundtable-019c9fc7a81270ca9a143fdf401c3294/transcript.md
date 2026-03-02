# Engineering Roundtable - Feb, 27

# Transcript
**Speaker 2 | 00:08**
Yes.

**Wesley Donaldson | 00:10**
Good morning, all. Jump in the boat.

**Speaker 2 | 00:13**
Good morning.
Get. F team.

**Wesley Donaldson | 00:27**
Yeah, guys, I'm not sensing the super joy like we're super close on commerce. It's going to be a great day, great couple of days. See, where is everybody? Participants?
Okay, let's jump on in. I'm going to skip a few folks, that's not a knock on you. For example, Dane, if you're here, we don't... I think your task is tucked in. Antonio, for you I'm going to... I'll come back to you last if we can, but let's... I want to focus more around commerce-specific priorities.
So...

**Speaker 2 | 01:20**
That's okay.

**Wesley Donaldson | 01:22**
So that said, let's jump into Germany.

**Speaker 3 | 01:27**
Yeah, I'm implementing the calendar thing now. I found a library that handles the ICS file and will meet all the requirements in the tickets, so I'm just implementing it now. I left a tidbit at the bottom about what I chose in line.

**Wesley Donaldson | 01:40**
Nice, that answers my question. Yeah, take a look at this library. It is actually very feature-rich, but I'll read through your comment. All I think my only worry with this one is just... Let's set our own go-deliverable on this product's direction if we can't get it in for the demo, it's fine. I just don't want to have it in process. We think we can get it great, otherwise let's just flag it and we can... Maybe take until Tuesday of next week to make that final call. That makes sense.

**Speaker 3 | 02:07**
Yeah. We might need to talk about it later, but testing it on mobile might be a little difficult just because I don't have a mobile device that I can use locally.
Maybe I can just download Android Studio and get the emulator for Android. I don't know how we want to approach that, but maybe you and I can talk offline about that because I know the...

**Wesley Donaldson | 02:31**
Yeah, that's not a block. Don't worry about it. We'll get you someone to... Who has a mobile device or someone who can enable you to test. I wouldn't worry about that.

**Speaker 3 | 02:41**
Sounds good.

**Wesley Donaldson | 02:42**
Keep going.

**Speaker 4 | 02:42**
I wa I wanted to add the for the other ticket in the Jeremy Spor e it's the confirmation page.

**Wesley Donaldson | 02:44**
Over to you.

**Speaker 4 | 02:56**
I think if you... Based on my branch, I can share that with you. You can implement this because we are already completing the purchase and getting the data from the backend, so you can use that to fill out this information.

**Wesley Donaldson | 03:15**
Perfect.

**Speaker 3 | 03:16**
Okay, I'll pick that up next. Once I get this one done, I'll ping you.

**Wesley Donaldson | 03:23**
Thanks you. Elvis. Look, CO.

**Speaker 2 | 03:30**
Good morning, Tim. So yesterday I got very important clarifications on the items I've been working on and been implementing them as we requested yesterday to Krisp on the packages page. Working on this part.
Well, I think I should be able to complete both pages today. Most of it actually is already in the PR, but yes, the remaining items should be ready today as well. I just posted a question for clarification in the chat. Whenever you have a moment, please take a look at it.
It's not a block of it this time, but if you could right answer that, it will guide me further. That's it, no impairment or block, thank you.

**Wesley Donaldson | 04:19**
You mentioned you had a few of these in review. Which one of these can we pull over to review just to reflect the current status?

**Speaker 2 | 04:27**
Let's see in the new page for sure. The static-based diagnostic filtering for sure. The API will still need to fix that and work on the product selection. So the top one as well?

**Wesley Donaldson | 04:47**
To one.

**Speaker 2 | 04:49**
Yes, please.

**Wesley Donaldson | 04:52**
Okay, right, thank you.

**Speaker 2 | 04:55**
Yes.

**Wesley Donaldson | 04:55**
Just to confirm, what's your confidence level there? Do you think high, medium, or low on...? We can get all these in for the end of the day today, just a team reminder. Our goal is we're going to do a meeting. I'm going to move the engineering session that we normally have in the afternoon. I'm going to move it earlier in the day, and the goal for that meeting is we're going to do a review, and we should be pretty much feature complete. There may be a few outstanding bugs or tweak items, but we should be feature complete.

**Speaker 2 | 05:23**
I'll do both of those today for sure. Yes.

**Wesley Donaldson | 05:26**
SE thank you, Jeffco.

**Speaker 2 | 05:26**
High level.

**Wesley Donaldson | 05:29**
Lance and are you with us?

**Speaker 2 | 05:30**
Thank you.

**Wesley Donaldson | 05:43**
You may have an audio issue there, Lance. I'm just going to move on. I'm pretty clear on what you're working on. You're starting the implementation based on the findings you're pairing with... So you're good to go. I don't think I'd ask Lance, and we can connect offline. The goal here is we're targeting mid-next week on the implementation.
I know you all took a pat. Sounds like we're closer than just a new ticket, but just confirming the target date for that, Mihao. I don't think Mihao is with us. I can give his status. He's still tracking. He's completed, he has... I saw a couple of PRs for him, so if we can just get some reviews up. There you are, Mihao. We were just getting to you, sir.

**Michal Kawka | 06:31**
I run a research for running late. I always forget that the stand-up on Fridays is 15 minutes earlier. Yeah, so I have a 3-hour or two-hour review right now. So one is the validation gaps. I have two playwright tests in review and a card CD box. Actually, I might have four because I already completed the card display, so we can move it to in review.

**Wesley Donaldson | 07:00**
So do we want to...? I think this one has already been merged in, correct? I saw that.

**Michal Kawka | 07:12**
It might have been merged. Let me double-check. Please, GitHub.

**Wesley Donaldson | 07:17**
Yeah, we can do that offline. I think my concern here is that this, since we're so far ahead in the overall process, I understand the value of what we talked about.

**Michal Kawka | 07:20**
Okay.

**Wesley Donaldson | 07:25**
So I think this is probably at the point now where we can push it to done just relative to the value it currently has. So if you can just get a quick review from maybe Jeremy, you have a little less on your plate than I do. If you can give him a quick review on this so we can get it off the plate in the next hour or so, as far as the additional task you have for Playwright, our goal was to end at the end of this week. Do you feel you're tracking towards that?

**Michal Kawka | 07:53**
Absolutely. So the Playwright 4 card display is in review. So we can move it to the correct column. I'm wrapping up the billing information, and I should be able to wrap up the payment information today as well.
So it's looking good.

**Wesley Donaldson | 08:13**
Nick, thank you for fixing that breadcrumb. It looks beautiful. How are you doing?

**Speaker 2 | 08:21**
Good. I, everything I had is, NROD. So I've started picking up stuff on the indoor.

**Wesley Donaldson | 08:28**
Perfect, I really appreciate the help over here.

**Speaker 2 | 08:33**
Yes, sir.

**Wesley Donaldson | 08:34**
Stepfan, are you with us? How are you feeling, bud?

**Speaker 6 | 08:37**
Yeah, good morning, afternoon. I'm feeling much better than yesterday, thank you. For 05:57, I just opened up... So waiting to see how the checks turn out and then I'll have it. Thank you. I'll have it.
I'll have some folks to review and next I will... I'm planning on previewing some of the Nicolas' tickets and I'm planning to work on 05:58 at least. Started working on 05:58 three.

**Wesley Donaldson | 09:07**
Okay, so in review we have time today. I think again, playwright is not a blocker but setting the expectation. Trying to get this... Things you're just taking it out. Let's maybe aim for early Monday or midday Monday. Is that reasonable just to... Again, trying to get it? I want to get all of these off our plates before the demo.

**Speaker 6 | 09:28**
Sure. Yeah, I think that sounds reasonable, depending on how fast the previews would go.

**Wesley Donaldson | 09:35**
Okay.
You're all... These last five minutes... You have a lot on your plate. But if you want to just talk us through generally where we are... Then if you want to go at a ticket level, then my question or concern would be if we can reflect the correct status. I feel like much of these are actually in review.

**Speaker 4 | 09:54**
Yeah. I just wanted to sync up with you after the meeting. If you have time to try to accommodate the tickets to the actual... If possible, that way we can have every ticket with the proper PR. But for me in my status, I completely completed most of the checkout page with the validations client-side and server-side, and I am doing the final integration with lenses. Completing the backton for that.
It's doing some changes in the diagnostics, Patton? Because in GraphQL, we needed to get some extra fields, let's say the iron code specifically. He's adding that so we can use that for the complete purchase.
So, we did some tests and it's working fine. He's generating the invoices and the accounts and everything. So, which should be good for the demo today to show that everything is working.

**Wesley Donaldson | 11:08**
Yes, apology. Stream, I'd ask you, Elvis, to... Let's use our demo time this week to focus on just where we are with Commerce rather than focusing on just individual feature development.
So that's the question to what we are bringing to the demo. The hope is to walk through the full checkout flow and you all this. Yes, I dropped a meeting after the demo and we probably will get through the demo a little early, but either way, I dropped a meeting after the demo for us just to sit down and talk and go through statuses and get everything updated on the board.
Okay? Just to bring us back. Antonio.

**Speaker 7 | 11:47**
Yup. I have this ticket reviewed by... Has some few comments. I'm evaluating those comments. But I mostly focused on the MT patterns in our applications.

**Wesley Donaldson | 12:04**
Can I ask you to make sure we get a review from Dane or Harry as well on this ticket? Just because it's larger than just the Mandalor team.

**Speaker 7 | 12:15**
Absolutely. Yeah, I asked them. I marked them in the shadow if you guys could take a look, please.

**Speaker 4 | 12:21**
I did have a look at that.

**Harry | 12:23**
I have a concern about defaulting everything to optional and then asserting that the value is there at runtime because we lose type safety with that approach. I put there's comment on there.

**Speaker 7 | 12:35**
Yeah, we discussed that part we can think of offline to online, but the idea was to avoid relying on engineers to keep this and avoid future issues. But yeah, we can discuss.

**Speaker 9 | 12:52**
Definitely.

**Wesley Donaldson | 13:00**
Francis, thank you for pairing with Dane and just moving this forward again. The hope and the goal here is I want to make sure that we are all using the release notes functionality. This is a mechanism for securing it. Lance, do you have an updated status on this or do you have a perspective on when this can be completed or if there are any blockers? He is not on...
Okay, no worries, I'll sync with him offline on that. But just a reminder, folks, like the Mandalor team, we are supposed to be using the release notes functionality. If you're not currently using it, that's fine, let's make sure you're enabled.
So please just raise your hand. How can you guide us through setting that up? There's detailed documentation on how to use it, but take a look at the documentation if you still need a little bit of a pairing session.
Please raise your hand. Let's get you all using that feature so the product team and the rest of the leadership team can have transparency into what's going on in all these bills. Thank you so much.
Okay, so just closing the loop. I'm not going to... If there's something interesting you'd like to bring to the AI workshop this afternoon, please just message me in teams, and I'm not asking Mandalor specifically for items for demo, we're going to just focus on taking us through the commerce experience.
If you're blocked or if you have a concern you're not clearing your next ticket, please message me and chat. Let's get you something to contribute to. Beth, please go ahead.

**Speaker 9 | 14:29**
Just very quickly before we wrap up. You answered my one question. I do need a full demo of our latest in e-commerce space. Then, Jeremy, I don't know if you saw my comment or if you already commented that I actually haven't checked my email. I'm curious why there were so many declines or failures on the ones that we re-ran.
If we have reasons for why they failed, that would be helpful for any manual processing we still need to do.

**Speaker 3 | 14:59**
Yeah, I love to do something on the ticket. But long story short, there are just double bookings. That's just the majority of them. Every time we do the rerun, double bookings happen even when we don't do a rerun.
So it's just the nature of our...

**Speaker 9 | 15:16**
Maybe there are many in a matter of six hours. That's nuts, but anyhow, yeah, that's just our system. Okay, I will let them know that.

**Harry | 15:29**
I have a couple of issues to raise. I just noticed we have an alarm going for SMS failure rate. I didn't have a chance to really look into it, but it looks real. Then we tried to go live about an hour ago,
and I just noticed the leg...

**Speaker 4 | 15:50**
Swap fail.

**Harry | 15:52**
I'm not sure we could look into that.

**Wesley Donaldson | 15:56**
Mihao is our resident alert monitor and build master, so, just unfortunately, I have to jump.

**Harry | 16:03**
Okay.

**Wesley Donaldson | 16:04**
But like Harry, can you hear with Harry?

**Harry | 16:05**
Yeah, same.

**Wesley Donaldson | 16:07**
Priority one over the playwrights the course.

**Michal Kawka | 16:11**
It just drops and b. Yeah.

