# AppDev Leads DSU - Mar, 04

# Transcript
**Jennifer | 00:40**
How is everyone's Wednesday going?

**Harry | 00:44**
Extremely busy. I was busy last night and this morning, but progress is good.

**Jennifer | 00:55**
Progress is good.

**Wesley Donaldson | 00:58**
Going well, a little busy, but mostly around planning stuff as opposed to implementing Harry. But feeling good about our status generally. So that's a great feeling.

**Jennifer | 01:13**
You wanna start us off? Withs?

**Wesley Donaldson | 01:15**
Mayor, it. Alright, I'm going to start with the status on the various production issues or challenges that we've been having. Let's start with where we are with the leg switching blue-green light switching.
So between Rinor and me, how they were able to manually get us into a good state to resolve the differences between the two legs. They've brought us up into a good state in the sense that we could... They've tested both the ability of switching between the two different environments. Harry, I believe that Meha connected with you and verified that from Rinor's side. You are good as well and the ability... We confirmed that we were actually seeing events for the PDF LLaMA from the PDF LLaMA for generating events. Generating print-based events. Looking good there. That was a question, but I'm...

**Jennifer | 02:07**
Awesome.

**Wesley Donaldson | 02:08**
Yes, we had another issue around the Event Store.
So specifically the issue was we had run out of disk space.

**Jennifer | 02:15**
Two he.

**Wesley Donaldson | 02:15**
We Rinor's direction or thought there was similar to stasis just as purging everything. It's a dev instance. So we were purged that the PR environments are up and running bills are working correctly. The bigger concern there is will we incur this problem again? France... This did increase the DV disk size for us.
But more importantly, I think we identified that we... The underlying issue was we weren't cleaning up streams or artifacts from the PR build.

**Jennifer | 02:40**
Correct.

**Wesley Donaldson | 02:41**
So coming out of that, we're going to create another ticket or I'm going to create another ticket that's going to be P1 as well. I'm maybe not an AI, maybe just a regular to focus on just updating the existing destroyer job to have a clean-up step as part of it. That way we don't incur this...
Jennifer, I think we can maybe have a conversation in a month or so just to talk about whether we want to save a little bit of cost and lower the back disk size back to 32 gigs.

**Jennifer | 03:05**
It's a good idea.

**Harry | 03:07**
So we started down this road, Harry, last night. I don't know that it's been purged yet. I think he's going to do that in the morning, but the...

**Wesley Donaldson | 03:19**
Sure. He said he had already perjured, but I'll confirm with him. I'll confirm that. Harry.

**Harry | 03:24**
Okay, yeah, because I know that the doubling of the size from Francis definitely has freed things up. When I look at the cluster and I look at the event streams, it still looks weird. We have unknown nodes and some odd things going on.
Yeah, I mean... Harry was waiting on a green light. But it does look like just destroying it and starting over is going to be the best bet.

**Wesley Donaldson | 03:43**
Three.

**Harry | 03:44**
And I did have. I had. I sent Mehall a branch and a ticket that I'd kind of made to start looking into it.
If you want me to send you that. Like regarding the Destruction for the PR Destruction.

**Wesley Donaldson | 03:57**
Yeah, that's. Yeah, if you already have a ticket, by all means send it over. I have a ticket on our board for just kind of like the events resolution.
If you. If we want to move it to your board. That's fine, too. That's his next priority item.

**Harry | 04:10**
Yeah. So I think we can... That's going to have to be me and Mehall so it doesn't matter who does the resolution. You're talking about everything in the park stuff.

**Wesley Donaldson | 04:18**
Yeah.

**Harry | 04:19**
Yeah. So how to look at those that's going to be just sort of... Check each one.
I think some of them are legitimately parked because it was broken. Some of them I did see a bunch of the PDF-generated ones were parked because of the old issue where we had the non-optional fields.
So those don't matter. We don't have to replay this. None of that stuff's running anyway. It's just there so that when we're ready to mail and we're ready to use our own stuff, we can. So we can probably ignore those, but the other ones I think are legitimate.

**Wesley Donaldson | 04:49**
I would love to get a perspective on when we can tackle this and if we can move it to pause if it's not urgent enough. We felt this was going to be a bit of an effort for Dana. You change your perspective on that. Any additional information? Is he available?

**Harry | 05:07**
Dana should be just about free. From our standup, he finished the perp issues and the spot result issues he was dealing with. This should be extremely straightforward. I found that we've got command handlers specifically in the connectors that when they receive events, they don't know they default through an error as well, which is part of the recursive loop issue we had causing the loss.

**Wesley Donaldson | 05:36**
Do you mind if I can ask you just to take a look at 06:19 and maybe add that as an additional point here in the acceptance criteria where you can take a look at it, ideally fix it, but at a minimum, get us a little bit more information. That way, I can create a separate ticket for it.

**Harry | 05:49**
Okay. So we want Dana to pick this one up.

**Wesley Donaldson | 05:52**
Yeah. It's already assigned to him, but just more...

**Harry | 05:54**
Cool.

**Wesley Donaldson | 05:55**
Can he grab it as opposed to is he the right fit for you?

**Harry | 05:59**
Gotcha. Let me'll check on.

**Speaker 4 | 06:01**
06:22.

**Wesley Donaldson | 06:03**
Then back to this, the main status. So overall good progress on just dealing with the events issue coming out of our meeting yesterday.
I have a meeting with just a few engineers just to detail out what epics we want to start building out to support the direction that Sam shared. A perspective that Sam shared based on the architecture call yesterday. Expectation is we'll have that documented out and the team will start picking it up come next week or maybe even on Friday. The rest of the board... I'm not going to go through this.
I'll just simply summarize and say all of the issues that we had identified as core features are already in ready for PD or already done. The next one is going to be the bucket that is the refinements that we have on them. Those buckets are in 624.
So in 624, everything here is either in review, done, or ready for PD. The reviews were blocking yesterday's... Why these are not ready for prod, but team members are just confirming their PRs are good to go pulling in Maine when they need to expect to have this fully completed. No actual work other than just cleaning up the PRs or outstanding inside of this epic. Similar idea for the next follow-up epic. The outstanding ones here were actually on Jira, but he was able to push all those into Ready for PD or he has one that's outstanding in review, but same idea. All of these are ready, are pretty close, and expect to be completed by the end of the day today. The only one that is not is actually around a visualization review that Devon did.
So I've asked Devon to focus on just doing that passive imagery thing. And he's opening tickets. He's promised to provide two tickets by 3 pm today, but that's the only ticket that's outstanding in this final cleanup review for demo.
There are small things that the team is grabbing just from... He's opened, I think, three tickets, four tickets in total.

**Jennifer | 07:52**
Devin showed me two tickets. Are they two more tickets from that, or is it just that he's filling up those more?

**Wesley Donaldson | 08:04**
He's yeah, so those were just kind of previous defects. And then there's one from yesterday which Jiffco has which was specific to the product page that he opened yesterday.
So that's assigned out. And then what I've asked him to do is I want one ticket, one defect ticket that summarizes all of the issues on the review and on the checkout page. So he's those are the two that he's kind of committed to being able to have for us. By two P mthree PM today.
And I've clarified with him the focus needs to be mobile first. So he's a he's aware of that. He pro. He's committed to actually providing that to us. I'm not worried about that. I think he's clear on the need and the team members are aware that that's coming. Jiffco is aware that it'sing Jeremy that's is aware that's coming for having it ready for Greg tomorrow morning.

**Jennifer | 08:50**
Perfect. Thank you.

**Wesley Donaldson | 08:54**
That's it. On Mandalore. Any questions?

**Jennifer | 09:02**
So with that stuff coming at 3 pm today, do you guys feel confident in having things ready for Greg tomorrow to do the demo?

**Wesley Donaldson | 09:10**
Yes, so the items that I'm expecting from Devin are not functional elements, they are... This is missing a drop shadow. This has a tighter radius than what's currently on the button, so that's the level of feedback he's provided in the last couple of defect tickets.
So assuming that's still the case, we would actually be ready now just minus the polish items.

**Jennifer | 09:32**
Cool.

**Wesley Donaldson | 09:32**
This one is after already resolved. This so his PR solves the first bullet here.

**Jennifer | 09:32**
Okay.

**Wesley Donaldson | 09:42**
There's a meeting on the calendar.
I know a few of you folks are blocked on your calendar, but Greg did commit that he can make that time so the engineers will join that session. But I did see... Jennifer, you had a competing priority at that time.
Cool. Over... Are you...?

**Speaker 4 | 10:07**
And yeah.

**Stace | 10:08**
I'm flying most of the day tomorrow and then our board meetings on Friday, so, yeah, if there's something you guys have to meet on, just add me as optional, but don't let me block you.

**Wesley Donaldson | 10:19**
Justin?

**Jennifer | 10:23**
Anything Stacy or Ray that you guys have questions on or Ray that you need to share?

**Speaker 4 | 10:31**
No. Since this... I know it's recorded, but it looks like the fix for the... What do you call it? Results in processes will now be shown correctly on the participant portal. So I have to go... I'll go verify some of the existing participants to make sure...
It's all done correctly, so it's going to be our UAT. We found the bug on a bin portal where it's displaying results ready as the status, even though it's not. So the good news is we found it. It will be fixed probably as early as Friday. Just because we have all our P1s going on.
But with those two fixed, we should be back in good shape on lab tests showing up correctly again.

**Jennifer | 11:35**
Just to add for that one, the status is showing up incorrectly on the admin portal. It is showing up correctly for the participant.

**Speaker 4 | 11:45**
Yes, it's two separate things. It's on the admin portal only. Yeah. The bug is on the admin portal only.

**Jennifer | 11:53**
Okay, awesome, I think that's it, thank you everybody.

**Harry | 12:03**
Wait, I haven't given an update.

**Jennifer | 12:07**
Well, I'm sorry about that, Harry, your turn, you go. Sorry.

**Harry | 12:15**
Okay, so I go back to this board. I like this board. It is the immediate one of deleting the Cognito users. We're now unblocked because we've got environments working again and things are in a stable place. As far as the work done, the issues, the live issues where with people's results... Dane is resolved, the manual spot, and then one of the people is just... It looks like it's been in transit.
So it's supposed to say "in process." It looks like that person will probably just need a re-screen. Here per resolved the DI, and it will give appropriate feedback now for the admin portal. So I know previously, it assumed things would work when they clicked buttons. Now if it doesn't work, it will let them know. So we have the new event for deleting Cognito users that exists and thrives now with optional fields as that's our new default. That stuff from Antonio went in.
I think we all agreed that we're going to be okay with a weak schema instead of strong type safety, and then once we have Emmett, we can relook at how that will help us around type safety. That's straight from Sam. This is the delete event. I added the soft deletes to the Aurora database in the user account table.
So whatever BI reports are generated, if they use a select star, they're going to have that new column. I don't know what that code looks like. I don't know if it shouldn't break anything, but just for awareness, the disk space issue... Francis added the doubled the capacity, which has helped. We still... The cluster still looks wrong.
So it's going to need...

**Speaker 4 | 14:16**
It's not that one.

**Harry | 14:18**
Yeah, I think Mihaal in the early hours of his time zone, which will be the night for us, he's going to resolve that so we don't mess anybody up now because it does appear to be working. Just the event store UI we still see unknown nodes and things like that.
Then this we found that what was causing the extra logs, which was there was a case moved to the wrong place when the... There was a new event added, not a new event. The new reason for sending emails was added. There was a case that got moved to a different place to trigger a check order interpretations ready, which triggered some downstream reevaluations which should only have been triggered during results updates, which resulted in extra events and extra logs.
So that is fixed and in production. The rest of our issues, everything else that was blocked by pure environments, is now unblocked. So those are moving again on the Cognito stuff. I can run the scripts this afternoon and the next step is moving all the commute events that we currently have in the vtwo stream to put them into participant ID streams alongside the recent password and deleted events that they'll all show up in those specific participant streams.
So at least we can use them in projections now instead of having to wait for a SQL Aurora projection, which is still to come. I think that is everything. I don't know, Jennifer, if I missed anything.

**Jennifer | 16:24**
I'm talking to you, I'm sorry. Nope, that works for me. One thing that you reminded me of is that Francis is now like... Because we have the stand-ups at the same time, he's trying to decide which one to go to. He's going to go to whichever one's most relevant for his work that he's working on now.
But if you guys have anything to talk to him about, he said just reach out to him after the meeting. So, if he's not in that stand-up...

**Harry | 16:51**
Yeah, it's... I mean, oftentimes, it doesn't really matter, but definitely that...

**Jennifer | 17:03**
Anybody have anything else? Have a good Wednesday.

**Wesley Donaldson | 17:07**
No, just... Jennifer, I'll be a little bit late. I got a book camping, and it opens at 12 pm for the summer, so I'll be maybe five minutes later to products...

**Jennifer | 17:08**
Thank you.

**Wesley Donaldson | 17:20**
Right? So you guys are there?

