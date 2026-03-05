# Mandalore DSU - Mar, 03

# Transcript
**Wesley Donaldson | 00:10**
Don't like how that looks at all.
Good morning, all.

**jeremy.campeau@llsa.com | 01:19**
Good morning. More.

**Wesley Donaldson | 01:25**
Let's give folks a couple of minutes. Greg, welcome to the party.

**jeremy.campeau@llsa.com | 01:32**
Thank you. It's good to be here.

**Wesley Donaldson | 01:40**
I'm going to get started, folks. They can join as they are available. We got Lance, we got Devon, Stephen, we got Hownds. Okay, so the first thing I want to start with is just a clarification for folks. I want to make sure everyone's just aware of where they should be pulling their epics. You should be pulling your tickets obviously off the board, but generally speaking, we have two epics that encapsulate all the work I shared. It's in teams 624, which is what we had from last week. Honestly, we need to get these closed out because feedback was given to us from last week. Great that most of these are in review or ready for PR, but anything that's not closed out already, let's try to prioritize closing these out because our pivot really needs to be around what we received yesterday as feedback for everything that we received. Yesterday's feedback is in 666. Weird,
but important. Individual tickets are assigned to individual engineers. But just be aware, we're not doing super detailed tickets for every single line item. Just encapsulating to align with the idea that these should be quick wins and quick implementations, not detailed feature buildouts from scratch. Just be aware of that again. 0624 is last week's feedback. 666 is yesterday's feedback. Working with Greg and Beth, those are the things that we're focusing on and prioritizing.
All right, let's jump straight in. Jeremy, let's start with you.

**jeremy.campeau@llsa.com | 03:20**
Yeah. So I had a PR up for my changes, then I got some feedback from you all, so I'm doing that now. But I think the issue that was pointed out in the chat yesterday is still going to block the builds from being able to smoke test and all that.
So until that's resolved, it won't be able to merge into main. But like I said, I'm still just implementing the changes that all of us mentioned. So yeah.

**Wesley Donaldson | 03:45**
Is your ch the blocker you mentioned was regarding the EI which me how I think you mentioned me how you want to do your status next.

**Michal Kawka | 03:56**
Absolutely. So the issue is not related, it's related to the storage. So Jeremy discovered yesterday that the disks on our Easy instances for the current DB store are full. So all three instances have consumed 32GB of storage that they were assigned. I posted a message where I mentioned you, Jennifer, and Beth. I believe if we are allowed to increase the volume to 40, 64, or 128GB, I mentioned the cost that the increase would cost. Waiting for the response. I'm happy to increase the volume
if that's allowed. That should resolve our issues. So that was unrelated.

**Wesley Donaldson | 04:46**
That's clearly a priority. I if I could ask you to just maybe message again, maybe a DM message, direct message to Jennifer, myself included, please. Let's get you the approval for that.
Sorry, Jennifer stays and myself. It's blocking commerce. So I would agree that it's a higher high priority. Can you take us through the. The other it the other issue you're working through as well as your just general status.

**Michal Kawka | 05:17**
Yes, absolutely. So I was mainly focused on resolving the high priority issue on prod with the event buses. So it looks like they're not working again. I have the root cause, so I shared it with the... Channel. What's the issue?
So basically we have a faulty switch-lag workflow. So we only check if the first rule is green or blue and we ignore the subsequent rules. So if there's a match, we let that workflow deploy today. An active Lambda.
But we don't check the subsequent legs. So basically, AWS doesn't guarantee the order in which the rules are returned if it's green or blue, and that causes the issue that some of the stacks are currently blue and some of the stacks are green. I summarized it all in the War Room and in general, I believe or in Mandalor. I shared my findings with Rinor because he was working on current connectors and the blue-green deployment for them, so I'm waiting for his response. Once I get a green light and approval to merge my PR, I'll do that, but I'm afraid we'll need a manual step on prod to fix the inconsistent state because as I mentioned, some of the stacks some of the lambdas are blue and some of them are green and even though it happened, the check passed.
So we are deploying but the state is corrupt. I'm going to ask Rinor to help me so that we have an extra pair of eyes to basically do those manual steps on prod and fix an inconsistent state.

**Wesley Donaldson | 06:58**
Okay, all right, thank you. Definitely just keep us in the loop because as Jeremy mentions, a few things are a bit of a blocker for us at this point in getting Commerce out. Thank you.

**Michal Kawka | 07:09**
Absolutely.

**Wesley Donaldson | 07:09**
How? I assume your review items you're just holding. We still ready for review for those?

**Michal Kawka | 07:17**
Correct.

**Sam Hatoum | 07:17**
Yes.

**Wesley Donaldson | 07:18**
Okay, let's give jifco LANs let's go to you.

**Sam Hatoum | 07:28**
Try to modify card behavior screen that is in review. So there's a PR created, it's got the same block or some of the guys' PRs at the moment. But I guess once that's resolved and reviewed, it can go into MA.

**Wesley Donaldson | 07:45**
Perfect. I assigned you. So Devon has taken the initial task, trying to true up Figma with the current experience. So he created a very detailed going through each individual screen and calling out specific line items and specific items that need a little bit of cleanup, but I'm going to be assigning those up based on availability. Lance, you had some availability, so I sent... I signed the first one for the appointment page over to you.
If you could take a look at that, please. Okay.

**Sam Hatoum | 08:14**
Okay. Is that based on the Figma? Does it need a review or someone to double-check that it's all still alive?

**Wesley Donaldson | 08:17**
Yes, it's based on Figma. I think we agreed as a team yesterday that Figma is the best source of truth that we have right now. So we're comparing to the live Figma.
Okay, Stephen next.

**Speaker 5 | 08:39**
Alright, good morning, Tim. So basically, I have two tickets in preview. They are waiting for code previews. I know Mikal was busy, but when you have a chance, please take a look. I've looked at Mikal's PR 640.
I think I have a question about that which I ping you about. Again, I know you're super busy, but whenever you have a chance, we can talk about that basically.

**Wesley Donaldson | 09:09**
Can instead... Are you comfortable? I don't know how it's priority right now, but just since we have bandwidth on... Is it possible for Lance maybe to pair with you to understand and use it as a learning opportunity around playwright and give you that PR review? Would you be comfortable with plans?

**Speaker 5 | 09:22**
Yeah, absolutely. I would appreciate that.

**Wesley Donaldson | 09:28**
Okay, let's go to your Elvis.

**Yoelvis | 09:35**
Hey everyone, I just created two requests for the changes, and yeah, I think it says important, but you refresh... You should say in review, you should move to invite review, I guess.

**Wesley Donaldson | 09:49**
Okay, cool.

**Yoelvis | 09:53**
Yeah.

**Wesley Donaldson | 09:54**
All good. Thank you for doing that. There were a few smaller tickets or epics inside of PRPRD 3. I closed out a couple of those just based on the status of where we are in checkout, but nothing for you to be concerned about. They were just there, but they were just very in the very beginning of the development effort. Any risk or concerns on your end, Elvis?

**Yoelvis | 10:23**
No, everything is looking fine for me. I think we just need to get the packages and diagnostic logic correct. Other than that, the checkout is working fine, and I did a few modifications. The only thing I wanted to ask is that I see we are creating good components.
Okay, maybe I can ask in a separate space.

**Wesley Donaldson | 10:51**
Yeah, let's do that in the chat, please. So, Jeff Codes, fortunately, was not able to make it to a doctor's appointment. He shared his status. He still... He closed out the direction of the channel. He closed out some of the older tickets or pushed them into ready for prod to represent the fact that we're tackling most of the feedback specifically in these feedback epics that he... I connected with him this morning just to clarify. He has everything he needs
from the conversations yesterday with Greg and Beth and team. He is confirmed. He was a bit unclear on the specific states, but that's now been clarified. No blockers from his end. Feeling confident for PRs and a day to today. Worst case into tomorrow, no blockers on his end. As far as additional I want to tackle, we have a few refactor items. Your Elvis wanted to confirm with you if you wanted to pull those in now, and my preference would be maybe giving that to Lance or Jeremy.
So maybe you, myself, and Antonio can pair on refining the epics and refining the tickets around commerce. What are your thoughts on that?

**Yoelvis | 12:06**
Yeah, you can assign to the other engineers. I have a few other things that I want to do, but I want to align with you, and we can see what I can do.

**Wesley Donaldson | 12:19**
Sounds good. Jeremy, one thing is that we never came to a resolution on the ad to calendar. Could you catch...? We talked about maybe pulling this back as it was in the... Wasn't a hard requirement for MVP. Thoughts on that?

**jeremy.campeau@llsa.com | 12:37**
Yeah. So the PR is up for it. And what it does is it acts according to the behavior that's in the ticket where it downloads an ICS file. So the ICS file, when you do it on a mobile device, it that basically prompts the user to open up the counter app and add it.
And on Desktop, you just downloads the file. I threw it into my outlook and I was able to have the appointment show up. So it does work, but because of all the issues we had with the building and stuff, it's just been stuck in review.
And then obviously, once other tickets get merged, I'll have to, you know, pull so I can just leave it in review. That's fine. Or if you want to put it in pause. And then once I finish the ticket I'm working on now and everything gets fixed with the builds, I can then just pull main into that, make sure it still works, and then it should be good to put into main.
So yeah, I think it's in a good spot, but obviously I'll prioritize the other tickets first and then work on that one after all the other stuff that comes up is completed.

**Wesley Donaldson | 13:37**
Perfect. Sounds good. You mentioned... Did I hear you correctly that there are PRs that represent some of this? Would you be comfortable moving these into review?

**jeremy.campeau@llsa.com | 13:49**
So the one that I initially had assigned to me... Maybe it was that top one. I forget, but one of them I put up a PR and it was reviewed. So you all left some comments. Now I'm working those out.
So that included the whole clearing the cart on the after checkout and then making sure that the data is accurate and not hard coded for the confirmation page like the email, the name, the appointment, stuff like that.
So I'm... It's now in review again because there was some... It's now in progress again because there were some things that had to do based on the PR.

**Wesley Donaldson | 14:27**
Got it, sorry about that. All right, a good... I can leave, but as we agreed, these are all very much tied up together, so they'll go together. No worries there.
Okay, anyone have a block, or anyone have a concern? Anyone's not clear on what they're currently working on? Francis, if you're on the line, my apologies. I think I'm comfortable with this, just staying in pause for now.
So I'm going to touch on that. Devon, thank you for doing opening that one defect. I'd ask you to continue doing that, and I'd ask you to focus more around mobile per... Staces direction. The majority of our customers are on the mobile.
So just keep going if you can keep flowing those in. Our target as a team is to get Greg a completed experience or as best as we can by early morning. Let's say 10 am give or take on Thursday. That's when he has availability to review.
But the goal really is to get it as fast as we can and get him to do reviews if we have something as soon as we can. So any blockers, any concerns? Anyone not clear on what they're working on? Nexts?

**Sam Hatoum | 15:31**
Somewhat unrelated, but somewhat related. I'll drop the mention of the chat. We are pointed at e-com production at the moment in the sandbox. So we're locking production appointments when they go through the flow. I don't know if that was intentional, but if it was, we...
It's not unlocking after 15 minutes at the moment. I don't know if there's a time zone issue, but we may just want to... If we are testing it because it is affecting the Shopify store at the moment not to pick appointments that are the next day or the earliest just so that we're not actually affecting customers that are going to the store at the moment.

**Wesley Donaldson | 16:18**
Great call out. If I could ask you to maybe post that in the channel and like you all this... Maybe we're going to figure out how to... If we can switch tab backs to... Back to sandbox.
So let's just...

**Sam Hatoum | 16:27**
But the caveat there is we have very little data in the test environment. It's going to affect how the demo goes as well.
So I don't know if it was intentional they performed that for a reason. I just wanted to call out that we are locking those appointments though at the moment.

**Wesley Donaldson | 16:49**
Yeah, if I could ask you to just message the channel CC Gregg, CC Jennifer, you all of us as well. Let's just address it there, please. I remember Beth saying that she had properly populated everything necessary, or she cleaned up the sandbox instance for... So in theory, we should have had what we needed there.

**Sam Hatoum | 17:11**
Yeah, we're currently sandbox is fine. I'm saying we're pointing at the. The Lifeline. C Star. SLA e com. Production endpoints?

**Wesley Donaldson | 17:22**
So sorry, you're talking about getting the appointment time. So the graph, the gateway API.

**Sam Hatoum | 17:28**
Yeah, correct.

**Wesley Donaldson | 17:29**
Okay, got it. Yeah, I'm sure that happened for a reason. I would challenge the team to provide what that reason was, and let's see if we have to do that.
I think the obvious... Let's not consume appointment times that we need for production, and if we need to, let's use a state that we have low probability of actually using those times, naturally. All right, guys, thank you so much.
Please stay on top of your tickets. Remember the goal. Remember... Close... Close out the older tickets you have focused on the milestone tickets, the feedback tickets. Thank you so much.

**jeremy.campeau@llsa.com | 18:06**
Thanks. Have a good. Have.

**Sam Hatoum | 18:07**
A good.

