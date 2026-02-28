# AppDev Leads DSU - Feb, 26

# Transcript
**Speaker 2 | 00:02**
They had a shopper fight outage yesterday. That's all that I know of. Unless there's something else that you guys are seeing.

**Jennifer | 00:10**
Just not just the stand up to we were worried about.

**Speaker 2 | 00:14**
No, we were just running through some of the more fine tuned things that they're finding now that they've implemented the larger things. There were just a lot of questions on little things.

**Jennifer | 00:28**
How are we feeling? I guess. Wess. I'll let you do your update and we'll see. Yeah.

**Speaker 4 | 00:35**
Much fun as.

**Stace | 00:36**
Sequel is.

**Wesley Donaldson | 00:38**
Sounds good. Let me just load the board. Forgive me coming in hot. 
Okay, I'm going to give a top line, and then we can go into individual, like, more detail on the board. Top line to what Beth was just saying. Getting a lot of smaller nuanced feedback and clarification, which is actually a really good thing. 
So we basically have up to checkout complete. There's small tweaks that we have to do, for example, around why we're presenting the membership and the membership discount. But generally, we are up to the review page and now working through our ability to place the order. 
So we have validation being done on the review page. We have all of the information that was done throughout the flow presented on the review page. And where we are right now, as I mentioned, is working through those minor nuances that happen throughout the flow, but more importantly, working on how to inject that order into recurrly. Last did a review on taking the PC that he did for the basic injection, taking the questions that we identified yesterday as part of architecture that's not architect as part of the product review product at that review. 
And then he did an investigation last night and has prepared a list of questions and a proposal on how to approach the injection into recurly. So that's ready to go for the call this afternoon. You all of this continues to take ownership of completing the checkout flow. 
So as I mentioned, he has validation, he has the implementation right now working with the base, pushing to recurly, and he's looking for the meeting this afternoon to just finalize the proposal that Lance has as well as just completing the process generally. Beyond the payment button, there is work that Jeremy is doing. 
So Jeremy's already kind of provided a PR review for the confirmation page. She has the updated direction on the ad to calendar. We feel that there would be plenty of time for us to get the add to calendar functionality as he's already taken care of the display of the confirmation page. 
So Top line and Beth jump in here if you disagree. Top line is, I think we're looking really good for the demo. The revisions the engineers are asking for are spot on. That's exactly what we want to do. We've asked them to tackle what was provided to them today and yesterday, and then we'll have another review session. 
I think we should probably aim for Monday afternoon for that session to give them enough time to action those feedbacks. That's the top line as far as going through the board. A couple things that were identified around the PDF event issue. We have come to a resolution on that. 
So we've actually completed all of the. Harry we've completed all of the resolutions for the dead letter cue, bringing those back and pushing them through the process, so that is good. We're we have a PR in place for solving that. Addressing the underlining concern with the S library going forward, making sure everything is set to default instead of sorry, optional instead of default. 
So good job on Antonio. Forget to that. We still have a couple of things inside of that epic. None of those are critical path. Right now Antony is going to prioritize. The next thing is setting us up for the future for commerce. 
So he's going to work on how does Emmett look like per the conversations we have in architecture yesterday. That's his next critical task, projecting. That will start end of day tomorrow into early next week. Go ahead. Are any questions on that? No.

**Jennifer | 04:18**
The only concern that I have is, you said like giving them like time to work on stuff. And then maybe Monday afternoon can we do like Monday morning, Monday midday. It still like Monday AFTERNONOON's going to give a lot of time on like at the beginning of the week. That where people might be waiting for something.

**Wesley Donaldson | 04:40**
Absolutely. Okay, there's a lot of smaller tickets here. I guess we can go really quickly. I would say the thing that's outstanding, the majority of the outstanding items right now are remains to be the playwright testing me how and Stepfan are both aware of those. Stepfan may need to take some time today. He's not feeling well, but I've asked him to prioritize syncing with me. How I've seen with me how specifically on what we can pull in for a playwright. He feels pretty confident that he can get through all of the pay items he currently has on his plate, as Stepfan has already taken care of one of the three that he had. I can ask me how to take on maybe the packaging selection from him. 
And we should be at a really good place with the playwright scripts by the end of this week. And again, reminder playwright tasks are not a blocker for the demo. Other thing that's kind of in process is around some of the filt, some of the work that Jico has for the review page, specifically around the diagnostic presentation. 
So he was one of the key people that needed feedback. So he had a feedback he needs. He's already provided a review, so most of these tickets are already in review. What we're missing for them is just the additional clarity that Beth provided. 
So feeling good about these being closed out for this week as well. We have, as I mentioned yesterday, we have an EPIC that is tracking all of the feedback items that we identified in our working session on Monday. 
So that epic we most of the tickets in there are in development or in review. So making good progress overall. I'm just closing out these feedback items. I'll create another one such epic for our Monday sync just to kind of have it all in one place. 
But again making good progress through these. And the ones that still kind of remain to be done are again the playwright specific ones. But Meha feels very confident he could knock those off. That is the status of. Checkout of commerce across Mandalore. Any questions? Of.

**Stace | 06:53**
That checkout integration proposal. You said for the meeting this afternoon. That's for the meeting with Rick Curly.

**Jennifer | 07:02**
Yeah, yes, okay.

**Speaker 2 | 07:07**
And they do have like did.

**Stace | 07:09**
We invite the right people to that ca re Curly didn't.

**Speaker 2 | 07:15**
Recuurly no, so I did I forwarded it to Jennifer and you all of this and Lance. Okay, and they do have an example of it up and running, so they can run a live example of inserting into recurrly, and then they can let us know what concerns they have.

**Stace | 07:37**
All right, great. Like all that.

**Wesley Donaldson | 07:42**
Nice.

**Jennifer | 07:44**
One more thing that came up. There was a ticket that Dane had worked on for missing, for people missing their, like, lab orders. Like, certain ones. You found out that when lab orders are getting added manually in the lab order tool and the information isn't going into the right places for it to get picked up and Thrive. 
From what I can tell, it sounds like this has been going on since. Like for Thrive, like for the length of Thrive with any manual orders. I'm not sure why. We're just seeing the issues right now, so I'm trying to figure that out. 
But I kind of got distracted with the other issues that happened this morning, but I that.

**Stace | 08:36**
Like a new feature, right? Because that was a miseduse case. So that should probably start with product figuring out what the whole process is and what the system's supposed to do with it, rather than try and hack it in as a bug.

**Jennifer | 08:52**
Okay, Lance has a PR up, but I'd rather do it like that. That was kind of my wonder is this the right way? What do we want to do? So I'm. I'm glad you said it that way. So I'll hold on that PR and. Right. 
I think we need to talk about that use case.

**Stace | 09:22**
It's interesting because I can't think offhand why entering it in the tool versus f of as submitting it would make any difference to us retrieving it from spot.

**Jennifer | 09:30**
But right now what's happening is in spot the or there's multiple spots where we get the participant ID, the first one that's not within the participant object, it's just a messy shape. The first participant idea is being set as the requisition ID, and then I think the screening idea is being set incorrectly. 
And so Lance's fix is when submitting it in the lab order tool, to set that participant ID and screening ID from the order rather than from the inputted stuff into Lab order tool.

**Stace | 10:12**
Yeah, let's talk about it. Because this actually might be more of a process fix than a code fix. I'm thinking right this because it's all those blinded identifiers, right? And FSA controls it when it's submitting the order, but they can type in whatever they want when they submit the orders. 
So we don't put controls around that. We'll never be able to, like, keep up.

**Jennifer | 10:32**
I mentioned that. I was asking Lance. Like, if they type in something, are we now overriding it? Like so they can't type it like, you know, like I'm worried about that.

**Speaker 4 | 10:46**
Are we talking about the lab ordering tool or orders that came through the lab ordering tool? May not or may not does not create the resells correctly because if it's missing the participant ID yeah, that I state does. 
And then I said what I was talking to Jennifer earlier too. And like we can't compensate for process that's unbeknown to us and or being done on a s and just be through and assume we need to fix for them like if they need something. 
And yeah, we can take it up like I agree that we can if we can just fix it on the processing level. I would to do it that way, but that's see.

**Stace | 11:35**
We I think so too. And I think you're right to have a question that Jennifer right. If we just change the business logic for every order, then I'd worry about are we inadvertently introducing some other sort of draft that may impact non man? [Laughter].

**Jennifer | 11:51**
Yeah. Yeah. He's only changing lab orders, but like, the manual orders. But still, it's exactly that. Like, yeah, what if we change it on something else forever?

**Wesley Donaldson | 12:00**
What? We on something else correctly?

**Jennifer | 12:02**
Like, I don't know what it all impacts.

**Wesley Donaldson | 12:03**
I don't know. I don't know.

**Jennifer | 12:05**
So I'd like to chat the one thing.

**Wesley Donaldson | 12:05**
So I'd like to have one.

**Jennifer | 12:09**
Ray, did you create a ticket for looking at the previous participants? 
Because that's one thing we can do is find everyone affected and at least fix them.

**Speaker 4 | 12:19**
I don't I it's. I thought it was just a daily occurrence. And that's why I stepping to pay that ticket. But if we want. Yeah, that's what I intended to say from the e mail, but if we want to just make a. Let me. 
Before the make. Make a ticket stays. I think. Let me find some time with you and staff just to have her walk through that process first. Then we can determine what can be done.

**Stace | 12:47**
No, that would be great, because I'd like to understand it, too. Because.

**Jennifer | 12:51**
Again, you might be.

**Stace | 12:54**
Of. I'm aware of the only reason they other than Peto they should be manually entering. Stuff is like retests and things like that where the original order or blood card failed. But if they're doing it for other reasons, we need to understand why.

**Speaker 4 | 13:11**
Yeah, number one is if they've been doing it for so long, why what happened, right? Did we? Yeah, and that goes back to state. I mean, I don't I hate to say it, but states like this goes back to the second example now. 
Right. The first example on Wellness go not completed correctly was the job that was done on during that round of product development. If this is on because of Michael Tanner on the lab processing tool process that wasn't identified, it's the second time. 
So. But we can talk more. I think you I'm sure you understand where I was coming from. So let's focus on understanding this particular use case on the process to see what we can do first and then we can solve this problem.

**Stace | 13:55**
Right? That.

**Jennifer | 13:56**
Finally, I have one quick thing that I don't have to go too deep into the costs of SOUDWATCH. It looks like the cost has come down, but there was stuff happening over this weekend that I'm still wanting to track down and see where it's coming from.

**Wesley Donaldson | 14:05**
So like POs come down and the fun of stuff happening over this weekend that I still want to have you see where it's coming from.

**Jennifer | 14:13**
I was doing that yesterday, but I'm gonna kind of like hold off on that, get through these other P ones and then hop back on that just because we don't have that cost anymore.

**Wesley Donaldson | 14:13**
I was yesterday, but I kind of like. Hold on. That. 
Because we don't have that much anymore.

**Stace | 14:26**
That's good. That the Shopify thing. Did we release something that broke it? What? What happened there? What was the no.

**Speaker 2 | 14:35**
We keep seeing periodic outages with that plugin that we're using for the custom blocks in the Shopify checkout page.

**Wesley Donaldson | 14:37**
That and that was already positive and that's something that I've seen as well.

**Speaker 2 | 14:43**
They Shopify did not report any outages. And that's something that I keep seeing as well. 
So between 1130 and 05:30 yesterday, people were not either not seeing the custom blocks or not being required for checkout, which of course is going to fail CEASTAR insertion because we don't have the necessary information.

**Wesley Donaldson | 14:50**
So between a list of prices yesterday people were not and not see we have who are not required for announcement or by our for what I have.

**Speaker 2 | 15:04**
So what we did last time this happened. Call center went through and matched any records they could, and C Star put it into a spreadsheet. And then Jeremy had a like a script to rerun the events using that information. 
Okay, so that was actually going to be my question before we wrap up.

**Wesley Donaldson | 15:20**
That was that before we wrap up.

**Speaker 2 | 15:22**
I know prod support we have been putting on end or.

**Wesley Donaldson | 15:22**
I know product before we have been or as of this we did it before they we here if not on critical things like that.

**Speaker 2 | 15:26**
I'm concerned about the timeliness of this because if we don't get it in before today then there may be appointments that don't get scheduled. Jeremy is not on a critical thing right now, so if you guys are good having him take it, that would be my preference.

**Wesley Donaldson | 15:36**
So if you were good at it, that would be my preference.

**Jennifer | 15:40**
And you work with Firman so that Firman knows the process?

**Wesley Donaldson | 15:40**
And you work with Berman. So the accomp shot over.

**Jennifer | 15:44**
Sure. Yeah, we'll have. I will ask them to do that great idea.

**Stace | 15:48**
Just have her in shadow and then somebody else knows next time.

**Wesley Donaldson | 15:49**
Somebody else knows time.

**Speaker 2 | 15:51**
Beautiful. Okay, yeah, we'll do that. I just got the spreadsheet from a call center, so I will create that break fix.

**Wesley Donaldson | 15:53**
I just want to break from CER. So I will read that site on one get order or in door.

**Speaker 2 | 15:57**
Do you want it on Mandalor or Endor?

**Jennifer | 16:01**
I don't care.

**Wesley Donaldson | 16:03**
Jeremy has a little time.

**Speaker 2 | 16:03**
I'll just put it on me to word.

**Wesley Donaldson | 16:04**
If my is busy, he take.

**Speaker 2 | 16:12**
Okay? And then, yeah, Jennifer, if you just want to let Firman know.

**Jennifer | 16:17**
That you too not done right now.

**Speaker 2 | 16:19**
Beautifulll. Okay. I'll get that. Over.

**Jennifer | 16:29**
You. Thank you.

