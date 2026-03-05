# AppDev Leads DSU - Mar, 02

# Transcript
**Speaker 2 | 00:12**
Good morning. Today is Monday SLT right? So we won't have Stace, Ray or Greg. 
I don't know if we want to wait for Sam LE.

**Wesley Donaldson | 00:37**
Yes. I'll ping hims if he wants to join. He doesn't always.

**Jennifer | 00:41**
I think where can get started definitely ping him because I think Harry and I wanted to go over our solution with him on one of the issues. We were talking to him on Friday. But we can probably get started while we wait for him.

**Wesley Donaldson | 01:06**
Good come.

**Jennifer | 01:09**
Hey, who wants to get started? West? Why don't you? You've got. You had your check in today?

**Wesley Donaldson | 01:14**
Yes, a few. I'm just gonna talk for a second. Sorry, apologize, I didn't have the board ready to walk you through. The most important thing is where are we with checkout with recurrly checkout for MVP? Overwhelmingly we are good. There are a few things that need to be worked out. 
I think the most critical in my mind right now is kind of post the order placement. Post order placement. There is conversation around how should you remember? Remember rendering the confirm page. We came to some decisions this morning on you. The use of local storage or session storage rather for the sake of presenting the e mail address, the appointment information kind of to fully hydrate that page. That direction is clear. Coming out of the meeting. Jeremy's actioning that. 
So up to behind the placement button, like no major concerns there. And our ability to render. Just be aware that they are outstanding tickets that we need to implement our outstanding task that we need to implement prior to the review flow. Prior to review flow, outstanding items have to do with the package presentation and the package diagnostic information presentation. We're going to be co is going to be joining the product app of Sync this in about half and fifteen minutes, half an hour to get clarity on that. Overwhelmingly, that is the simplest way of describing that is much of that is dynamic right now. We took the feedback in previous day's sessions around making much of that some of that static, full transparency. That direction wasn't actioned properly. There's still there were questions posed rather than just following the instruction I was given. That could be an opportunity for us, Beth in the sense that we save our implementation having to replace this data with a dynamic implementation down the line. 
But that is a bit of a miss on process. The conversation we'll have in about a half an hour should give us the clarity we need. The perspective from the team is that's should be pretty straightforward, especially if we can just update the data coming back out of recurrly another right.

**Speaker 2 | 03:21**
Yeah. The. Just. On that note, and we can dive into this a little bit before the end of the meeting. I need to get the sandbox environment to a point where Greg can demine to the board on Friday, and I don't feel that it's there right now, but let's circle back around after you finish your updates and then we can. 
I have a suggestion on a plan, and I want to get your guys the feedback on it.

**Wesley Donaldson | 03:50**
Okay, sounds good. The other items are lower priority. We could pause. The lower bet. Do you want to dive into that, or do I'm happy to continue with just the lower priority items?

**Speaker 2 | 04:05**
Yeah, just a quick update is good, and then that way we can talk about what. What may need to get pushed aside for now.

**Wesley Donaldson | 04:12**
Sounds good. Lower priority items are around Playwright. With the exception of one item, all of the playwright tasks are testing tasks have been pushed into either in review or are ready for product. 
It's a good status there, but a reminder those were never intended to be blockers. Although concern we had. Another occurrence occurs of the poor term. Another instance where updates or alerts or concerns with the build environment but those stem from us just not adding to the Destroy script around the change that we've made for the TE Commerce application. 
So me how? Address identified and addressed those as well as making updates to ensure that Destroy action removes all of the Commerce related features. COMMERCELATED AWS resources that we were using that we're using. 
So that's been resolved around the idea of alerts and just managing and being transparent with what's concerned in the system. He's still working on the ticket to get to formalization of how other engineers, including myself, including any stakeholder, can use a predefined process to continually monitor and continue and then be able to action if there are events, if there are issues in the system that are effectively blocking or creating a challenge for the system. 
So that's a little bit delayed. The goal for my goal for that was for Tuesday. The goal for that is probably going to move to probably Wednesday or worst case, Thursday, but he's actively working on that. He's the point man for looking at these events, so he's already taken a couple for us. 
So he will be continuing monitoring events, but as part of that monitoring, writing up this documentation to empower future engineers. That is it. For Metalor. Any questions?

**Speaker 2 | 06:08**
No. Let's just use after Harry's update. I just want to talk about what needs to happen before Thursday. [Laughter].

**Wesley Donaldson | 06:18**
Sounds good.

**Speaker 4 | 06:23**
Update pretty short. Mostly just dealing with issues. The node updates going to happen today. We still have a couple of things from Verman waiting on business. I'm assuming that's going to happen this week. Is the two year recorders not in M may and the updated verbiage on scripting. 
And I've got a couple of things on admin portal around unhandled errors. So the first iteration that was pretty rough. So I was just going through all the different edge cases and putting appropriate errors there so we can see what's going on. 
And then the big one is dealing with the situation where we have users signing up to Cognito but ending up with their old pego. I know, Jennifer, if we want to start that conversation.

**Jennifer | 07:20**
Yeah, at the end of this.

**Speaker 4 | 07:24**
That's. I mean, that's pretty much it. A few errors in admin, portal and legacy other PRP, and then we have a few more errors to work through in the backlog. That's it.

**Jennifer | 07:47**
Okay. Do we want to talk through what? And the, questions that you had about the status?

**Speaker 2 | 07:57**
Yeah, so, the drive for Friday is that we have the UX in basically as pretty as we can get it, right, because the board, they're not there. They don't really care if the data is getting into CSTAR at this point. The visual is what's really going to drive our progress and how far we've come. 
So there's just a few things that I'm seeing inside of the UI, and I think they're just things that we missed between like architecturals that were made and just kind of like having to flip flap flop back and forth. 
So West. If we don't have anything that's like super time sensitive for the refinement meeting for Mandalor today, what I would like to do is invite Greg to that meeting, since he's the one who will be taking this to the board on Friday. 
And run through all of the behavior that's in current sandbox and notate everything that we need updated and then prioritize it. I don't. I guess I'm looking your feedback on that approach two.

**Wesley Donaldson | 09:10**
I think that's absolutely ideal. I go to that meeting already, but I'll get another one on calendar. Maybe I'll make it a half an hour. Split the two different concerns.

**Speaker 2 | 09:22**
Sure. Okay, yeah, just make sure that Gre, however you set it up before, was fine. Greg did have it. So that's my main concern, just making sure that he has everything that he needs going into Friday. 
And then I am cleaning up the recuurly instance from my experiments, so that will hopefully give us a better view. Where are we at? As far as the work that's done being in Sandbox, is there quite a bit that's waiting to be merged in.

**Wesley Donaldson | 10:05**
No, everything there's some playwright stuff that's still kind of in review. As I mentioned, you all this has a few tick overwhelming. Most of that should already be in the sandbox. We had a couple PRs outstanding. 
I'll push the team to get those into Sandbox for the review with Greg. But the functionality is there.

**Speaker 2 | 10:23**
Yeah.

**Wesley Donaldson | 10:25**
Everything that you all the showed this morning on his local host. That's available in A PR to go to sandbox.

**Speaker 2 | 10:34**
Okay. Yeah, if we could get that in the sandbox, that would be really helpful because I'm still seeing, like funky pricing things and all that kind of stuff, and it's hard to know like what was already tackled and just waiting to be pushed in. 
So let's do that. That would be really helpful. I think that's my main concern right now is just getting sandbox to current state of the work that's actually done and then reviewing it to prioritize anything that needs to be tweaked.

**Wesley Donaldson | 11:19**
Do you have bandwidth this week? To. You mentioned that there are items that you needed to update in recuurly. For example, the diagnostics. Do you have bandwidth to do that in the next day or two?

**Speaker 2 | 11:31**
It will be done by the end of the day today because I'm out the rest of the week, so the recuurly configuration will be completed hopefully before I have a meeting this afternoon to review it. 
So I'm trying to get that done, but I have meetings back to back. But regardless, by the time you log in tomorrow, we currently will be updated.

**Wesley Donaldson | 11:50**
Okay. Perfect. Thank you.

**Speaker 2 | 11:57**
And if I do have time, I know there were some smaller stories that the team could potentially pick up, but I want to hold off on that until we run through a review and see what needs to be tackled. I don't want to start new stuff until we've button up everything that's still out there.

**Jennifer | 12:21**
As he creates the stories and button them or like, and button up. I think like we'll just like the stories and everything as they come in. And then as far as like other people around I know. West you're talking with some people about the next stage and everything and starting to like, design the tickets for that work. 
And I'm gonna be doing the same with like, Dane and Lance about the Azure side of things. So there are other things that are going to be happening outside of the technical like development as well.

**Speaker 2 | 13:00**
Right? Yeah, so product stories will be light for this week because the focus should be on the tech enable and stuff.

**Jennifer | 13:09**
Yeah, I think that running list of fish fixes that we're going to need or any issues is going to be great. And anybody who can jump on them. And then West, if there are people that are not busy, let us know, and we will try to find, like, next steps for them.

**Wesley Donaldson | 13:39**
Sounds good.

**Jennifer | 13:43**
Anything else on e commerce?

**Speaker 2 | 13:48**
I'm good for now.

**Jennifer | 13:50**
Okay. And then Sam, Harry and I wanted to run through, like, just our full thinking after, like, our conversation on Friday. I think we have a really solid plan for handling the user management for Engagement Portal. 
So if anybody is not interested in Engagement Portal or wants to save their brains space for only e commerce, feel free to jump. 
I was waiting for Beth to jump because I knew she would break. Is not able to handle more West. Welcome to the EP world. If you want to join. So I'm going to go through like Harry's R FC and kind of like add in like the plan that we kind of just agreed upon this morning. 
I'll go through the context first for West, especially since he's still on. So right now we have Thrive Cognito users and participants that are in Thrive that are invalid and cause issues creating, valid accounts due to, contac method collision issues. I'm just gonna keep updating it while I talk to you guys. 
Okay, so first issue is that Cognito accounts are not created for all users. Back when Harry ran this, I think in November December there were 3000. I'm not sure if the issue has gotten worse or if it was just the one time bug. I'd love to see that number before we start deleting people. Harry of who has a participant with no account. 
But so we had some issues before and there's no way to fix this from the call center. The only way to add an account right now is to physically go into a of US consul and create it. Because of the way that we have set up the logic to create Cognito accounts only being on participant first scene. 
So if it ever had an issue, it's never going to get created again. So that's the first issue. The second issue is that Cognito accounts are created for old or invalid users, preventing the correct user being created. This is kind of how that happens. 
So I'm going to skip that, but, right now, if the user signs up like that causes a user signing up but not being able to see their latest results due to a mismatch of PA goods. And then, if we decide to delete. 
Well, we've decided to delete those users from Cognito like those accounts. Let's say someone does eventually, like Cogn or the call center decides, this person should have one. That's going to make the problem of not having Cognito accounts worse unless we fix that. 
So it's kind of a two step. We can't delete these people without fixing the problem of creating Cognito accounts. So this is kind of a list of how we're selecting users. I'll come back to that, but right now, our immediate option, I'm going to delete this and just talk about go forward. Is that okay? Harry? 
Okay, so go forward, what we want to do is create a new, pugnito account event. So it's in the Cognito account stream. And that's gonna be Cognito account deleted. And Harry, like, will find a way to, like, trigger like creating that event, through a script that he's creating that that'll delete all of the PIDS that we found are invalid or old. 
And then once that's done, it's going to basically put us in a state where we have a bunch of participants without Cognito accounts, but they will have a new event on their Cognito account stream. That's called Cognito account deleted. That'll help us with state and I'll get to that in a second. Then we plan on creating these new events as well. Cognito account requested, which will trigger creating an account and then something to tell us that the account has been created. 
And tell me if I'm getting how this event stream is, if I got these events wrong, or if you have suggestions. I'm totally open. I am very new to the event sourcing world. And then the last one is we want a button on the admin portal to actually create this Cognito account because that way if for some reason our logic down below misses a use case, this helps the call center to fix that. User I believe that the logic down below is going to fix all of the normal like cases, and the only time we're going to be using this button is on edge cases. 
But I do want that ability for the call centers so that they are able to pull up a participant GUID and create like a Cognito account so that the user can sign in.

**Speaker 4 | 19:26**
So do we want to leverage existing code? And I'll tell you why that's important in a second. Or do we want a separate path for that creation? Because right now we had to make the call on e mail or phone collision that if it collides, the priority goes to the currently existing person. We could introduce a second path where it's like, no, this is an override create, right? 
So I'm going to create this Communo account with this email address, and if it exists in there, you're gonna get it. This new one's gonna get it.

**Jennifer | 20:06**
That would. I want the same logic because they can fix the emails by deleting the emails from users and adding.

**Speaker 4 | 20:17**
So you want to.

**Speaker 5 | 20:18**
Okay.

**Speaker 4 | 20:19**
So then in that case, you could have the button kind of do all of those things, right? Because obviously, if it's only going to work if they previously deleted the either deleted the comito user and that event is there or whatever, or they remove the email from that Cognito user. 
Because ultimately the issue is there are multiple peaks per user per email. That makes sense.

**Jennifer | 20:50**
So this button on the admin portal is going to be from a Peguit specifically.

**Speaker 4 | 20:56**
Yeah. Okay, so do we want. Do we want to force the user of the admin portal to click something to remove their old one and then click this new button to create a new one? Or do we want it to just happen?

**Jennifer | 21:10**
I don't want them. Like, I let's. Let's talk about that. This is probably like. Let me change this one to being, like, more future. And then we can talk about some of those things, actually. Like, let's get through the first three and get these ones locked down. 
And then let's talk about this one, because these are good questions.

**Speaker 4 | 21:37**
And then my next question for Sam. We talked briefly on Friday about issuing commands. So I think what makes sense to me is we introduced the new event. So Kito count created. Ko count deleted. And then the command. Great Cognito account requested. Now thatmand I think. Does it make sense to just wire that up to an PI endpoint? 
And that way we can trigger it however we want to trigger it, whether it's the portal or manually from local? Is that how you would imagine that working?

**Jennifer | 22:17**
I don't think I've gotten through these other things. Do you want me to talk through this first? Sam.

**Speaker 5 | 22:23**
Before we get to that, I want to understand one quick thing. So when we're talking about this cogny to account the stream at the very top just the stream design. So I think you had that point a and maybe it's here can you describe a Little Bit, please? 
Okay, fine. So it's. It's just up there. So the cognitive account stream is this per user.

**Jennifer | 22:46**
Is it needs per Cognito account. So Cognito user yes.

**Speaker 5 | 22:53**
So a GUID and that's going to be a predictable GUID that if I'm in my Thrive SE, I can know how to fetch events on that screen by just having the GUID dash. Coleto something like that. Is that correct?

**Speaker 4 | 23:10**
Yeah, it would be on the pier.

**Speaker 5 | 23:13**
Because we got to have it predictable, right? Like we're when we're deciding to do any business logic, we're going to have to evolve state from a combination of the participant stream as well as the coponito stream for that participant. 
So we need to be able to predictably find them by convention.

**Speaker 4 | 23:33**
Yeah, I can look again. I'm pretty sure it follows the same convention as the participants one where it's just Cognito accounts and there's a peago at the end of it. Okay.

**Speaker 5 | 23:42**
Because that's the biggest gotcha like if we do something different, then we're no, we're not gonna.

**Jennifer | 23:47**
Me to check. I may still have it open.

**Speaker 4 | 23:53**
They have to reconnect its participants.

**Jennifer | 23:58**
Here's Cognito account. Okay. So this is a participant ID yeah.

**Speaker 4 | 24:04**
Very cool, that's what I thought.

**Speaker 5 | 24:06**
It's then we'll go on that one on that front, what's is that a date.

**Jennifer | 24:12**
The date of the stream being created.

**Speaker 5 | 24:16**
And it does that match with Thrive? Is that predictable?

**Jennifer | 24:23**
It's how we've done all of the streams, like even the yeah, the stream has it's like how they name the stream, it's like a versioning of the stream.

**Speaker 5 | 24:39**
The stream's fine. It's just not. It's not dynic or like. I'm.

**Speaker 4 | 24:41**
I'm okay Sam is it is part of the name.

**Speaker 5 | 24:46**
That's the big thing we have predictability between the different streams. Now I'm connecting now I'm with you, right? So from there we're getting through Cloud watch. Whatever the events, they're coming from Cognito. They're going into the stream. They're not putting the other stream looking for the data. 
I mean, for all intents and purposes, they are kind of the same stream. We treat them like that, but they're separated by a namespace. If you think about the events. Still, one more thing, like one more thinking frame. What I just said there is like there's a bit like a git commit. Sha there can only be one head commit. 
And so if a participant is created, then a participant receives a result, then a Cognito event for that participant in the other stream does something, and then the participant does something in a Thrive stream. In the normal screen, there are all sequences of events in the global chemic order, and so for all intents and purposes, we may as well just be thinking about what comes from Cognito and what comes from the participant stream. 
It's just one stream. We'll just split them for clarity, but ultimately it's like we're treating them as one. You see what I'm saying, we have logically, physically they're different, but logically, they're the same.

**Jennifer | 25:55**
Yeah, okay, and that's fine. So this is really about clarity when I'm splitting it here. Yes. Where the event comes from.

**Speaker 5 | 26:02**
Hundred percent. Well, it's the right thing to do. Don't get me wrong. I just wanted to, like, give us all the common thinking frame that when we see this, it's just one big sequence of events. All right, so I'm with you now. I'm tracking. 
So.

**Jennifer | 26:16**
So then you were talking about states, and this is kind of how this next section got created. I was trying to think through how do we know when to delete, when to create because that is very that needs to be very clear. When are we creating the events again or the thegnito accounts again? 
Because we don't want to create them in the wrong place? So I was kind of going through and, getting like the Cognito or like, basically instead of having to check Cognito is this account created? Because that matters, because we don't want to like, try to attempt to create it all the time or trigger Cognito or check Cognito. 
So this is going to kind of track the Cognito account status. And so this is kind of like any time it goes into reset, then now the states like if the last date is reset then or if the last event is reset, then it's active.

**Speaker 5 | 27:27**
Okay, so you just mentioned this is a command. I'm seeing here.

**Jennifer | 27:32**
Yeah, this one's a command, so maybe I need to separate it because I don't know what I was doing as kind of using it as an event, not knowing whether this is.

**Speaker 5 | 27:41**
That's no worries. And yeah, I'm just trying to understand that. So the resultant event would be.

**Jennifer | 27:52**
I was kind. So this shouldn't be done on the requested. So this is what I was thinking was the event I don't know what the command would be.

**Speaker 5 | 28:01**
Yeah. I mean. I'm just.

**Speaker 4 | 28:03**
Understand the go ahead that is the command.

**Speaker 5 | 28:06**
So there's two I'm just putting on my like lower level model. Sam ll n right. Like if I was like at the simplest model, create Cognito account is the command, but then Cognito can requested as an event. 
So, like, just yeah.

**Jennifer | 28:22**
That's exactly what I was thinking when I was trying to do it. I was trying to match the other events.

**Speaker 5 | 28:27**
So, yeah, I mean, like, it's which event are we? So. I'm just trying to make heads and tails this fine as a plain command for me. I know exactly what that would do right now. What's requested, what's the requested top?

**Jennifer | 28:50**
That was just me trying to do the event from.

**Speaker 5 | 28:52**
And I see what. Okay, so but then you're saying that we don't know if the account was created. We just know that the request to create the account went out, but we don't have guarantees that it was created. Is that what that means?

**Jennifer | 29:06**
Because I wanted to do the Cognito account created off of when Cognito actually like. Like I'd want to do it off of Cognito because if I create a button on the admin portal, I want that to like do the event that triggers the Cognito account creation.

**Speaker 5 | 29:24**
How do we create an account with Cognito? Is it synchronous? CO yeah.

