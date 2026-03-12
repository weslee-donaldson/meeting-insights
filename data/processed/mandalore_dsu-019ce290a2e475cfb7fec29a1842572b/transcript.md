# Mandalore DSU - Mar, 12

# Transcript
**Wesley Donaldson | 00:22**
Good morning.

**jeremy.campeau@llsa.com | 00:25**
Good morning. How are you?

**Wesley Donaldson | 00:27**
I cannot complain. Not too bad.

**jeremy.campeau@llsa.com | 00:30**
That's good.

**Wesley Donaldson | 00:30**
A dreary, rainy day here. But I actually like dreary rainy days.

**jeremy.campeau@llsa.com | 00:35**
That is nice. It gives you an excuse to slow down and just stay at home and not go up.

**Wesley Donaldson | 00:42**
Working from home. It's a very easy excuse to make party all.

**jeremy.campeau@llsa.com | 00:44**
[Laughter].

**Speaker 3 | 00:54**
Morning, AR.

**jeremy.campeau@llsa.com | 00:56**
Good morning, Wesley. Do you know if there's anyone from Exalvio that won't make it? I know sometimes some of the guys aren't on the standup.

**Wesley Donaldson | 01:03**
Yes, but I'll give their status. So just run it as if they were there, and I'll give you their status. There's only one person... How has a conflict? He couldn't move. So I'll give you his status.

**jeremy.campeau@llsa.com | 01:16**
Okay. Got it. Right. It looks like we have everyone from LSA and... He's not going to be here, so I was going to go over his ticket first, actually. So I'll just go over this. I checked the PRs, and I think this still needs a review. I can't remember. Do you have anything to update us with, Wesley, on this one?

**Wesley Donaldson | 01:46**
So he's rerun the events that he discussed yesterday. He's still working with Harry and Jennifer just to close to get a final blessing on this.
But effectively, this should be completed. There is no PR that needs to be reviewed on this one. We did split out. There are some additional 50 or so events, I believe, or 5000 events that are related to a different... If you open 55754, for order ready, this is... They're working on this right now. He's expecting to parallel the effort on this task. Just waiting for rates to just confirm that we can actually run this because it will actually trigger an email back to the user.
So once Ray confirms this, he's going to send a trigger running these events and then in parallel, I can close that one in parallel. He's working on the DLQ alerts. So expecting to have a PR for the DLQ alerts today and having the events complete running today as well.

**jeremy.campeau@llsa.com | 02:48**
Okay, sounds good. Cool, I think you said this one's basically done, but I should still wait to move it.

**Wesley Donaldson | 02:54**
Yeah, I mean, I asked him just to let me know when it's blessed. Harriet and Jennifer are aligning and then we can close it out, but he hasn't given that yet.

**jeremy.campeau@llsa.com | 03:05**
Okay, now, CDS are ready for prod. Do you know if this one can be moved to done? Or I think you might have mentioned it.

**Wesley Donaldson | 03:15**
So we're looking for... I think Jeremy. Thank you for the review on that. So this can be moved to done. My hesitation here is I want to choose the next hold on. My citation here is I want to choose the next person in line on this ticket, which is just handing it off to someone. I pinged you, Elvis. I pinged you as a possible next person.
So hold it there for now but I expect to close it today.

**jeremy.campeau@llsa.com | 03:35**
Okay, and I see if you are assigned to you. Can these be moved to done or are you still reviewing them?

**Speaker 3 | 03:44**
I'm still reviewing them just to make sure that the changes are as expected. I'm almost done with that one there. 682, and then I'll be on to 683.

**jeremy.campeau@llsa.com | 03:56**
Cool, sounds good. I see this one. I think it still needs a review. Right. Antonio, I saw this PR.

**Antônio Falcão Jr | 04:05**
It is in review. I will be sending... I would be sending you guys the request for a review, please.

**jeremy.campeau@llsa.com | 04:15**
Okay, this one for me, I realized I actually need to implement it. So thank you, Wesley, for pointing that out. So I'm going to work on this one after I work on my current ticket.

**Wesley Donaldson | 04:25**
Can you pull it back togress then please can you pull it back to in progress because there is a follow up on it, unfortunately.

**jeremy.campeau@llsa.com | 04:26**
Juve Cook said it again.

**Wesley Donaldson | 04:32**
So, yeah, I may just create a separate ticket for it. Just to reflect the fact that most of this is already done.

**jeremy.campeau@llsa.com | 04:40**
Okay. Yeah. It might be that some of it was done with all the other discrepancies we've done, so maybe we can talk about it after.

**Wesley Donaldson | 04:48**
Let me hold, like, maybe go through it. I'll hold. And you just let me know if we need to create something separate for it. I don't want to create more tickets unnecessarily.

**jeremy.campeau@llsa.com | 04:56**
Okay. I believe you have PRs up for this.
Do you still need people to review them or have any of them been merged or anything?

**Speaker 5 | 05:09**
I'm working with you on the first one. It turned out into the scheduling issues on the calendar due to a couple of items. We actually have four or five items on the first ticket. 696 for the calendar and some of them enlarged the calendar and that cascaded it to other issues.
So I've been working all afternoon and this morning on those. Going back and forth with your office as well. Should have it probably in a couple of hours and then can move forward with the next one.

**jeremy.campeau@llsa.com | 05:43**
Cool. And does... Is this one completely separate or is it dependent? Like can we review this one separately or.

**Speaker 5 | 05:51**
Are these more UI stuff? Can you review it separately? A good question, I'll check on it. I know it currently has a much conflict, but I can quickly resolve that. If they are separate, yes, probably.
I'll check on that and we'll be able to review.

**jeremy.campeau@llsa.com | 06:07**
Sounds good, thank you. Antonio, is there something here that you need someone to review, or is this something that's already been merged?

**Antônio Falcão Jr | 06:17**
No, we need to... I need you guys to review it, please.

**jeremy.campeau@llsa.com | 06:22**
Got it? Yeah, just thank us for whatever you need.

**Wesley Donaldson | 06:26**
Did you get that infrastructure ticket in? No. Is thatd.

**Antônio Falcão Jr | 06:35**
Good point. To get ready for prod. What I need now is to get it reviewed and then I have to run a prepopulated script to three buckets for prod. They have just before the merge. But the DNS and the DevOps and our teamwork is done already.
Yeah, the ticket is completed so I'm good to merge it.

**Wesley Donaldson | 07:00**
Nice.

**jeremy.campeau@llsa.com | 07:07**
Cool for mine, all this... Thank you for your feedback. I'm implementing that right now. It's just too small thing. So thank you for that. Who's this? Francis sang here. Is this one?

**Wesley Donaldson | 07:23**
But he's not on... Like, the last status on this was he's waiting for it ops to basically figure out how to support this request.

**jeremy.campeau@llsa.com | 07:31**
Okay, got it, thank you.

**Wesley Donaldson | 07:31**
No update on that yet.

**jeremy.campeau@llsa.com | 07:37**
Okay, I think we already went over Mihal's tickets, so I don't think we need to go over that again. I am going through my... No blockers. This is my next priority after I fix the PR changes and then I'll move to this one. Jeff CO do you have any blockers on this one? The Recurly Ingestin CDK stack?

**Speaker 5 | 08:03**
I currently don't. I have a couple of questions, but I'm just, continuing on the 696, and we'll do the 713 first. And when I complete those, we'll get back to recovery poo in the afternoon, so. No.

**jeremy.campeau@llsa.com | 08:19**
Sounds good plants any blockers on the recurring web processor? LLaMA.

**jeremy.campeau@llsa.com | 08:28**
Yeah, I have opened up the ticket. I have some open questions on the scope and direction of it. I'm... Asan... To provide some insight on it. Then I have a second comment. The one that you're looking at now. Yes, those are the questions, okay? You don't have to go through them one by one, just like I was hoping to get some insight and then...

**Wesley Donaldson | 08:54**
Yeah, I think you're the best person to kind of, like, pair with plans on this. I could set up a meeting for us.
Yeah. I'll set up a meeting for us. Just to connect.

**jeremy.campeau@llsa.com | 09:06**
Okay, and then the second comment at the top is put together. A small RFC that probably relates to the JFF KCDK stack ticket.
It's not a huge document, but I thought it'd be worth at least going through to make sure we're on the same page of what we're building.

**Wesley Donaldson | 09:26**
Let's add to that meeting this afternoon and all three of us, four of us, will pair and just get to a good clarity on the direction from architecture this afternoon.

**jeremy.campeau@llsa.com | 09:37**
Right? Sound good?

**jeremy.campeau@llsa.com | 09:40**
Cool. Thanks for that information. All right, you'll have us. Do you have any blockers on this ticket?

**yoelvis.mulen@llsa.com | 09:53**
No, not blocks. I am just doing some small refactorings, but yeah that's that'sing fine cool.

**jeremy.campeau@llsa.com | 10:05**
All right. I think that covers everything unless there's another section. Nope, no other section. Is there anyone who had anything they wanted to mention or any other blockers or anything that I didn't get to cover?

**Wesley Donaldson | 10:21**
I have two call outs. No, any questions?

**jeremy.campeau@llsa.com | 10:24**
Okay. Is this something you need to show your screen for? Or do I need to open a ticket?

**Wesley Donaldson | 10:28**
No, you're good.

**jeremy.campeau@llsa.com | 10:30**
Okay.

**Wesley Donaldson | 10:30**
So please watch the ordering of items inside your column. I know there are a few things that are kind of P2s, so watch. I'm trying to pull up the ones that are at the top of the to-do column. That really is the order you try to attack them in. You all of a sudden know you have a few things. The ones that are towards the bottom in your column, they're definitely more... As I mentioned yesterday, just procedural, setting us up for future success. While the ones at the very top are like, "These are the things that we identify we need to do as part of the recurring refactor." I'm...
So those are if there was a P1.5, that's the ones at the very top of each new column. The other thing is, I'm seeing a lot of things that are going multiple days. Maybe an exaggeration.
Maybe a day or so in the review column. So we need to just do as a team, watch, and help each other out in getting things out of review. Please. I see the request inside of the teams channel. I would say, "Go a little harder, ask me who's available for a review if you're not sure, or just directly ask them." Antonio is probably the best person to help out. Do a review on the recurrently CD C DK stack stuff.
So, Antonio, I'd expect you to say, "Antonio, give me a review on this." I don't think we need to sign tickets for a review to get reviews, but we may have to go that route. Let's try to see if we can just explicitly ask team members and again, peer with each other, help each other, get tickets out of review.
Then the final item I have... I mentioned it earlier on my house ticket. I'm looking for a volunteer. I think right now it's yours, but I want to have a second person as part of that conversation. So I'm looking for a volunteer to assist with just proving out this document and proving out the playbook that we have inside of it. Jeff, I feel you're on a very critical path with the recurrent stuff.
So it feels like it's probably Lance, Devon, or Jeremy as well. You'll have to mention it now, but think about it. Take a look at the work you have and see if you think you have two hours per... Probably an hour, realistically, per day next week to just be part of this investigation, watching alerts and just getting comfortable with that process.
You just message me by the end of the day, please? That's it.

**jeremy.campeau@llsa.com | 13:00**
Cool. Alright, thank you, everyone. Have a good day. Like Wes, we said, if you have a PR up, just feel free to ping me or anyone else, and we'll just try to get those things reviewed. Have a good one.

**Wesley Donaldson | 13:13**
Good help.

**Antônio Falcão Jr | 13:15**
Let's go. And talk to you later.

