# Mandalore DSU - Mar, 04

# Transcript
**Wesley Donaldson | 00:13**
Good morning.

**Speaker 2 | 00:17**
Good morning. Are we preparing this session?

**Wesley Donaldson | 00:25**
Yes.
Stephan, my perspective on any business meeting is I always assume it's recording. I actually assume everything... Do every time I do it is recorded. Why am I sharing my whole screen?
We know when you guys can see the board.

**Speaker 2 | 01:04**
I can see.

**Michal Kawka | 01:04**
It.

**Wesley Donaldson | 01:06**
Alright? We got eight people. That's a good quorum right there. Let's jump in and see if we have... We do. Okay, all right, let's go from top down just any urgent priorities... How let's start with you. I see you moved your... To done that's awesome. Thank you so much for the effort on that. You just shared your status as a basket pro.

**Michal Kawka | 01:33**
Absolutely, everyone. So the issue with the broad services being out of sync, some of them being on green and some of them being on blue was resolved today. Rinor and I made a manual step to bring them into a consistent state. We fixed the leg switch workflow on GitHub. It was tested on dev. It worked fine in both directions, so switching from green to blue and from blue to green it worked fine. Harry tested the workflow for prod because there was a like switch. The PDF mailer Lambda started producing the events and parking them on the event bus so they reached the APA destination now and it ABO is triggered so that was fixed. It looks like the issue with the Events storage DB being out of the disk storage is resolved.
Yesterday Francis increased the storage from 32GB to 64GB. Yesterday in the late evening, though, the nodes were in a broken state because there was something failing with the leader election. I don't know the details, but we were in a broken state.
But it looks like the nodes recovered now and the events storage DB is stable so your branches should be unlocked. You should be able to generate test data and run the visual regression test. So it's working. I talked to Rami about it and he suggested purging the event stor db completely.
So it's that. So most of the data is not required anyway because it's just the orphan streams that weren't removed of the Destroy job. So we discussed that we will purge the events. 30db. We'll recreate the stack, and we'll add a manual step to the sorry, not a manual step. We'll add a step to a Destroy PR job to basically clean up the stream once the branch is merged or closed.
Because that wasn't happening. And that's why we. We run out of the disk storage. On. On Desk for the events. 30 D.

**Wesley Donaldson | 03:46**
Okay. Just priority order. This is a lower priority, so I'm going to actually go lower this priority for us just to keep you focused on the build-specific items.
So your next tackle item, if you could please, is going to be around just the resolution of the dead letter queues for and or PDF. I know you're probably already looking at that, but just that's the pairing you're doing with... Just because we have all these in PR already.

**Michal Kawka | 04:10**
Absolutely.

**Wesley Donaldson | 04:15**
Can you just give a perspective on whether these PRs are good to go? They should not have been non-blocking, but do you need to pull... Maine back in to get these in a good place for review?

**Michal Kawka | 04:26**
To be honest, I didn't have the time to clean up my boards. Some of them were most likely merged, so I'll take a look after the stand-up and I'll move them to done in case they were. I saw that Antonio approved one of my test PRs yesterday. Thank you so much for that.
So I'm going to merge after the stand-up, and I basically clean up the board because, to be honest, I didn't have the time to do that.

**Wesley Donaldson | 04:46**
Yeah, no worries. So this is not urgent, honestly, we agreed, playwrights are not blockers. So give it thirty minutes max.
But focus more around just the closing out and the build issues that we had... You, Sir Antonio, start with you.

**Antônio Falcão Jr | 05:04**
Hey, Tim. Good morning. So I have no big news. I'm still working on the MT patterns.

**Wesley Donaldson | 05:10**
Coming in really low, buddy.

**Antônio Falcão Jr | 05:14**
Mick. What about now? Guys, can you hear me better?

**Wesley Donaldson | 05:16**
Yeah, you're going now.

**Antônio Falcão Jr | 05:18**
Okay, I don't have great news about this. Not big news, I mean about this. I'm still validating the design. I hope I can release an APR on this today afternoon, and I will talk with... As late as possible for us to set up a presentation. Something that I can share my findings on this work with you.

**Wesley Donaldson | 05:45**
Do we think we can target the end of the week for this?

**Antônio Falcão Jr | 05:46**
Alongside...
Yeah, sure. I intend to finish my tasks later today, so... Yeah, we are good to do that on Friday.

**Wesley Donaldson | 05:57**
Okay, perfect.

**Antônio Falcão Jr | 05:58**
Yeah.

**Wesley Donaldson | 05:59**
Antonio, your next task is going to be around the back-end post order placement flow. So we have a couple of epics for that. We're working in the background to get some tickets in for that, but just like that's your next priority.

**Antônio Falcão Jr | 06:13**
Okay, that makes sense.

**Speaker 5 | 06:14**
Yeah.

**Wesley Donaldson | 06:15**
Devon, you don't have anything on the board, but you have one action item.
So catch us up on where you are on progress you're making there.

**Speaker 5 | 06:23**
Sure. I've been going through the design, mostly comparing our current to the Figma, and I put up two defects with a couple of minor discrepancies, and I'm working on another one with the mobile view primarily, focusing on the review and checkout pages, so I'm hoping to get that finished before two.

**Wesley Donaldson | 06:53**
Thank you so much. So that's actually a really good segue to you, Jeff. What Devon is working on is actually related to just polishing around all of the pages within the checkout flow.
So specifically, I've asked him. The 2 PM is just getting us anything we can by 2 PM to give you enough time to take a look at those refinement items relative to the review and the product page.
So want to give you your status. Just be aware of those. They may... There will be another one coming. Ideally, another one coming to you by 02:00 PM today.

**Speaker 6 | 07:27**
Sounds good. So, yesterday I completed the package and gave you the page of dates. All five of them. Thank you very much. You always do the per later in the day. So I was able to merge it and move the ticket that 670 in ready for broad. This morning I completed the hardcoded package description as well, and the PR up ticket is currently in review.
If any of you guys have a moment, please take a look at it. Actually, I'll post it in the general chat as well. No impediments at this time. Just have to note that they discussed with me how the lease notes seem to be broken currently
but that shouldn't be preventing us from merging and moving forward.

**Wesley Donaldson | 08:26**
I'm going to move this in progress for you.

**Speaker 6 | 08:26**
Thank you.

**Wesley Donaldson | 08:28**
That's your next tackle item?

**Speaker 6 | 08:32**
676. Okay, I'll give a description of six.

**Wesley Donaldson | 08:33**
Yes, sir.

**Speaker 6 | 08:37**
Okay, I'll take it on, thank you.

**Wesley Donaldson | 08:38**
Thank you, Jeremy. Over to you.

**Sam Hatoum | 08:44**
I just picked this one up.

**Speaker 2 | 08:46**
No blockers or anything.

**Sam Hatoum | 08:47**
Just starting to work on it.

**Wesley Donaldson | 08:49**
Perfect LANs.

**Sam Hatoum | 08:56**
Hey, I have a couple of items in review. I combined them into one ticket. One is the key discrepancies, and others are just some of the cart and screen map behaviors. The one is in review, but I'm making a change at the moment that I'll have pushed up in a few minutes.
Then both of those should be able to go out shortly. I did see that another ticket was assigned to me for the orphan account.

**Wesley Donaldson | 09:26**
Yeah, exactly.

**Sam Hatoum | 09:27**
You might have to talk about our approach here and some of the pros and cons.

**Wesley Donaldson | 09:35**
Yeah, this is really very much an investigation ticket. So, pair with you... This is just to see what we need to do here. This is more of an opportunity than it is necessarily a hard requirement for us while we get some additional things in from product next now on board, Stephan.

**Sam Hatoum | 09:57**
Y.

**Speaker 2 | 09:57**
Good morning. I have a couple of tickets in preview. I reached out to LAS this morning to double-check the DPR and a quick Google from there. One thing I was going to ask about is that we've talked with Yogis about the current Playwright test that we have and the next steps for it.
I think we do need to... I can create a ticket for CI implementation, but we need to talk, as a whole team, and define what we're going to do going further.

**Wesley Donaldson | 10:33**
Yeah, let's if we could target this afternoon for that. I think... Mehole, I'm not going to ask you to stay late for that, so I think we'll... Let's stress Stephan, your... And myself. Let's stress if we can do it, and then we can connect back with me tomorrow morning to get his perspective if he has anything relative to that. That sounds good.

**Speaker 2 | 10:54**
Yeah, sure.

**Wesley Donaldson | 10:55**
Cool and Stephan, like I'll confirm with Jennifer, but my expectation here is you're kind of pitch hitting for us once we kind of close these outs and get that direction and how Playwrights fits within the CIA C process. I'm not expecting to assign any additional tasks over to you.

**Speaker 2 | 11:13**
Sure.

**Yoelvis | 11:13**
Yeah.

**Wesley Donaldson | 11:14**
Cool. Thank you for jumping in and being a hero for us. You're all us. Nothing on the to-do list for you.
As we talked about, do you want to just give us a perspective on what your focus is? Any concerns you have around checkout?

**Yoelvis | 11:30**
I just wanted to give a heads-up that yesterday we did some changes and some automations, and now the tickets are moving automatically. When you create a pull request, the ticket is going to be in review.
It's going to move to "in review" automatically, and when you merge a PR, it's going to go to "ready for prod." So you don't have to do that manually anymore. It's a good thing, I believe. Other than that, I added a GitHub action to add the ticket, the Jira URL, and title into the ticket description.
So when you open a PR, it will automatically put the Jira ticket URL and title in the PR description. That is very helpful. So you can just click and go to the Jira directly. You don't have to search by the ticket number or that add.
I've been working on reviewing the requests and identifying a few areas of improvement. I would like to pay with Lens, as Wesley mentioned, to see how we can tackle the backend. I have some ideas I'll share,
but I would like to validate with Lens because he's a specialist in the area.

**Wesley Donaldson | 13:04**
Cool. We don't have everything urgent for this board. Plus, he's hosting the same status that Francis... I saw that we have. Well, Francis is not on, but basically, we're still... This is paused for now, no block is there.
Okay, I think that's it. Is anyone unclear of their next ticket? Again, we are a little bit light on the to-do column, that's a known quantity. We have the backflow for order coming. We have some refactor that things folks have picked up, and we have some quick win not opportunities from product that we'll be assigning out today into the end of this week for tackling on Monday. My ask for the team is I'd like to use this week's AI workshare as an opportunity for us to either bring problems or bring solutions that we're actually working through. It doesn't have to only be AI; it can just be interesting, innovative work that we've done using technology.
It's a learning opportunity. So if you have a need, a query, or you're curious about something, please raise it as a topic. So maybe someone can help us with that, and we can use the session on Friday to present it. In lieu of that, there are a few topics that we haven't gotten to. Jeff, I know you had a few. Me, how you had one as well.
So we... You will use that session to actually just go through those unless someone else raises a need or something an opportunity they'd like to present. Sound good?

**Yoelvis | 14:28**
How good?

**Wesley Donaldson | 14:30**
All right, good folks. Reminder, our goal is to have everything completed by the end of the date today. Ideally,
but let's be honest, the worst-case scenario for the demo tomorrow is that by tomorrow morning, we're looking really good on those close-out tickets. So 06:24 as well as 6606 and 06:24. We're basically done with these.
So guys, thank you so much for prioritizing. Once we get all these reviews done, these can all be completed. So really appreciate the hard work on that and getting us ready for the demo. Thanks, guys.
Right. Have your one.

