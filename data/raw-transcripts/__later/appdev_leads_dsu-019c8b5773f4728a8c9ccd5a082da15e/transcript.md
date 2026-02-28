# AppDev Leads DSU - Feb, 23

# Transcript
**Speaker 2 | 00:49**
I thought it was super cool. My kids looked at it for half a second and they were like, yeah, cool, MoM. And then they just wanted to smash it.

**Speaker 3 | 00:58**
My gosh.

**Speaker 2 | 01:00**
But I was like, look, science, engineering. And they were like, we don't care.

**Speaker 3 | 01:11**
I love kids. They never play with the things that. Like the way you expect them to.

**Speaker 2 | 01:18**
That is very accurate. That's very similar to the QA process. [Laughter].

**Speaker 3 | 01:25**
My gosh, we should just have kids do all of our QA. We probably or we shouldn't.

**Speaker 2 | 01:33**
No, I think they would be very close to the end user expectations. [Laughter].

**Speaker 3 | 01:40**
Yeah, again, we shouldn't, [Laughter].

**Speaker 2 | 01:47**
I think today is the SLT meeting, right?

**Speaker 3 | 01:51**
Yeah, okay, I don't know if Harry's jumping on or not. He might be in the middle of that PA one, so he might not jump on. 
I am probably the most close. [Laughter] What's going on? Just even though, like, Wes and I have basically been doing catching up. I had to only catch up from a half a day, but it feels like a half a year and. 
And I should never leave again. It sounds like.

**Speaker 2 | 02:30**
Not when we're trying to move at light speed. [Laughter] Wow. You know, my life gets in the way and it's got to take priority.

**Speaker 3 | 02:40**
So I think there's a lot of admin portal bugs that, the indoor team has assigned out and they're picking up this morning.

**Wesley Donaldson | 02:40**
Yeah, I mean, I.

**Speaker 3 | 02:52**
Some of them are already done and like NPR or getting pushed. So there's movement being made on that of the world and then on the other side of the world Wes. I don't know. Do you want to give what you realize as the update, or do you want me to give a brief overview?

**Wesley Donaldson | 03:10**
Let me take a stab. I will have gaps, so please help. I think the priorities for last week specifically around diagnostic, around participant, the package information as well as getting starting to consume the Miro Designs that at a high level, we are like we've done the packaging work. 
So Lance Germany, they've kind of Jiffco, Lance Germany, we've kind of knocked off the priorities that we had targeted for last week. So good on us for that. The other priorities were around the Endoor team jumping in to help us out. I would say the adapting to the UI sounds like, we've already updated all of the UI components to match the Designs, the existing UI components. The gap that exists now is the actual pages. We need to verify that those displays actually work correctly. I was looking at the test site this morning, the test EE Commerce Store site. Most of the Designs are there, but there's still some functionality. 
That's a little bit weird. So I think we need to just do a good job of revisiting what was already done and confirming it actually works in the new. Design as well as the functionality now that we're using a dedicated domain. 
So compliment to Antonio for getting the PR environment and the test environment up. So that's another accomplishment for last week. And the things that I'm not clear on or I'm concerned about is kind of everything from the cart presentation. 
So it looks like you all of us took a big stab at kind of creating all of the integrating all of the UI for the card flow. I need to see that and get a better status of where that is. A similar idea around some of the work that Dane did as a perception that we're we've completed much of the UI buildout around the card functionality. Yes, we haven't done integration yet with Rick Curley, but it sounds like much of the card. There's a perception that much of the card visualization UI and functional UI functionality already done. I'm not clear on that yet. 
So that's one of the things I talked about in the meeting this morning of looking to use that engineering session this afternoon to just. Everyone come with. Here's your status. I'll walk through all of the individual epics and get clarity. 
Like from the top down for being able to show a screening to be to what our plan is for actually being able to complete the checkout. So that's kind of my plan for the meeting this afternoon. Uses the me as a chance for everyone to speak to what they understand and what they have completed. 
And then how do we actually make sure all that is connected correctly as a team?

**Speaker 3 | 05:44**
Awesome.

**Speaker 2 | 05:46**
The only thing I want to call out Wes while you were out, there were a couple of updates that had to be made to the design, but our Designer was out last week, so, some of the design Elements required some walk throughugh and some explanation. 
So when we're validating what we see in the test environment against the Figma, if there are discrepancies before any work is done, just check with me because there may have been a part of the design that was missed when we made an update somewhere.

**Wesley Donaldson | 06:22**
Okay, do we I don't know the relationship with the Designer, but traditionally I'd want to have the Designer kind of not QE a but just take a pass once the screen has actually been completed. Is there that' be.

**Speaker 2 | 06:35**
I would say that will be me. Our Designer is very tied up on other things and just stepped in to help move this along. So as far as actually validating what's going on the screen, I can help out with most of thats.

**Wesley Donaldson | 06:50**
Okay, that's fine. And the other big thing for me was making sure we're clear on what we want to tackle our prioritized refine in the product. Product XA dev session as you saw we I invited I'll think with Jeremy hopefully can make it but definitely minimum you're all of this I may invite me how to that as well because he has bandwidth. 
I know our preference is to have Germany own much of that, but just. Just for the sake of not losing a day. I may invite Miha just to be a part of that meeting as well. And I.

**Speaker 2 | 07:21**
Got it ahead.

**Speaker 3 | 07:24**
By bad. I talked to Beth after I told you Wes. And I guess, Beth, you go and tell him, or she's not quite ready for that conversation until tomorrow. I was just had high hopes for her. I, like, thought she could be better, but, you know, it's just like diamonds or something.

**Wesley Donaldson | 07:42**
[Laughter] doing enough right?

**Speaker 2 | 07:46**
Yeah. I wish I could write two pretty in depth requirements in, you know, two hours. But that didn't happen before.

**Wesley Donaldson | 07:53**
Exactly.

**Speaker 3 | 07:56**
Thening her kids fake things about fairies.

**Speaker 2 | 08:00**
Yes, yeah, and I had some homework.

**Wesley Donaldson | 08:02**
That actually works out really well, actually, because I think we need to get to a good known state before we start consuming more.

**Speaker 2 | 08:09**
Sure.

**Wesley Donaldson | 08:10**
So I think that works out perfectly. 
Plus, I hate the idea of asking someone if they're, like, struggling with basic power water to jump on a call. And I know we wanted to have.

**Speaker 2 | 08:19**
Yeah.

**Wesley Donaldson | 08:19**
Maybe be part of the checkout. Checkout. Review.

**Speaker 2 | 08:25**
So, I did set y'als and Lance on that spike path. So I met with them on Friday and gave them very high walk through of what is what are we expecting when someone submits an order and how should that look in recurly? There were a lot of questions from the technical side, which is what they're digging into. 
So making sure that we're using recurly in the most out of the box solution as possible. Obviously there is some customization that has to happen because we're just a very unique use case. So they are digging into the different options for implementing some of those things. What I'm trying to do is schedule a call on Thursday with Rick Curly's API guru so that we can go over the suggestion or implementation that they come up with and have them pull holes in it and just make sure that we are doing what we should be doing and what makes the most sense. 
So they have all that information for actually submitting the order into recurrly. And we went over some of the validation that needs to happen as they are submitting the order. So like what happens if the credit card information is wrong? 
And the payment gets declined. What does that response look like so that we know how to handle it? So I set them on some of that stuff. I'm still working through the high level actual write up of the validation piece, but they do have the order submission piece.

**Wesley Donaldson | 09:53**
Okay.

**Speaker 2 | 09:56**
I'm working on that next, hopefully in the next hour or so. 
So I can hand that over to them and they have it actually written down. And then I'll be circling back and doing the more detailed user scenarios and the acceptance criteria. So those two. I'm hoping we can get through product refinement tomorrow afternoon. 
And then.

**Wesley Donaldson | 10:15**
Sorry. You mean tomorrow at 12:00 Eastern?

**Speaker 2 | 10:18**
No, I need to do the higher level product refinement with, our internal group, just to make sure I didn't miss anything. But I think from there, you guys probably need to do an internal architecture review on Wednesday around those things and anything that y all this and Lance have. 
So that going into the Thursday meeting with Rick Recurrly, we've got as refined of a technical solution as possible.

**Wesley Donaldson | 10:46**
Okay, so you're meeting internally to refine us tomorrow afternoon. So I'll move the architecture meeting to Wednesday. And I guess my only ask them would be. 
And I'm sure you do this anyway, but anything that comes out of that refinement. I'll make a point of looking at those tickets tomorrow afternoon. Anything that you flag. If you want to flag to me, I'll take a look at those. 
And I can at least share that with Antonio to start thinking through that before the architecture meeting.

**Speaker 2 | 11:14**
Sure, I did record the walkthrough I had with Lance and you. All this on Friday? If you want, I can send it over to you. It is transcribed so I can send you all that information.

**Wesley Donaldson | 11:24**
Yes, please. The other thing I would ask is the my understanding is the goal is end of week as defined by end of day on Friday. I want to double confirm that, and I just remind me again, what are we bringing to the board? Are we bringing like are we bringing. Basically, since we are having this meeting with Rick Curley on Thursday, i'm worried about if we're going to get all the validation done and the ability to complete an order done by our goal of end of Friday.

**Speaker 2 | 11:50**
Yes, I think happy path need doesn't happen. All the edge cases. I would say if we can't get to them, then I'm not as worried. So like if we can't get to validating the card number and things like that, I would like to see that, but as long as I can go through the happy path, I put all my information incorrectly. The UI looks as buttoned up as possible, and then I can show them that the order is inside of Hercuurly. 
That's really what we're looking for.

**Wesley Donaldson | 12:27**
And all of that by. So sorry, when? I'm trying to plan for if we need a little bit of weekend time just to make sure we can make this happen. When is your meeting next week? Is it first thing Monday morning? 
Like, what's the runway I have?

**Speaker 2 | 12:41**
No, it is on the sixth, I believe, but I don't know what time on the sixth, so I would say we need to have everything wrapped up by the latest Thursday.

**Wesley Donaldson | 12:49**
Okay, so we'll say the latest Tuesday then, to give us some space for things to bleed over, because it will, or even Wednesday.

**Speaker 2 | 12:54**
Got it?

**Speaker 3 | 12:56**
I'm hoping like the Happy Path, the best of like or basically Happy Path and everything to be done by Friday and then next week can be spent on validation and integration.

**Wesley Donaldson | 12:56**
Okay.

**Speaker 3 | 13:10**
Like, any, like, final things that we'll need to put together.

**Wesley Donaldson | 13:16**
I think my only counter to that would be maybe calling it moving it to Monday just to account for if folks are late on stuff that's committed to just giving them a little bit time on the weekend to resolve it.

**Speaker 3 | 13:28**
You're so nice.

**Wesley Donaldson | 13:30**
Am I'm here Asan.

**Speaker 3 | 13:32**
Okay? He's like. I wanna be nice.

**Wesley Donaldson | 13:38**
Okay, I think that works then. So let's see where we are in the 02:00 pm. I'm just gonna spend time just lining up the epics. And Beth, I saw like, Jennifer, you took a savage. Just doing like one or two tickets for the sake of getting it represented on the board. 
I'll probably just do like a one UI ticket inside each one of those epics, like especially the one that Dane has. He has two of them, and they don't show up on the board because they're just at the epic level. 
So I may just throw in one ticket there to represent the UI fixes needed so we can more accurately reflect them on the board.

**Speaker 3 | 14:10**
Yeah. Okay, that makes senses.

**Wesley Donaldson | 14:14**
Okay, I think that's everything, so just let me summarize. We're not going to we don't need to have the product of for the sake of engineering refinement today. We'll look to have that tomorrow. Understanding that that's not going to be everything that we need to tackle. 
That's just going to be what's possible with the understanding that the additional work you're bringing to Beth, you're bringing to refinement. Tomorrow afternoon we'll get feedback coming out of that, and then we will have that feedback addressed in the architecture meeting, which I'll move to Wednesday. Hopefully I can get that 01:00pm slot again, hopefully.

**Speaker 3 | 14:51**
Okay, yeah, one PM on Wednesday, if that's the only time you can get, that's fine, but typically I'm out at that time.

**Wesley Donaldson | 15:05**
Okay. Okay.

**Speaker 3 | 15:06**
Wait, no, not 01:00 pm Eastern. Never mind Arizona t my mouth.

**Wesley Donaldson | 15:12**
Yeah, I'll check calendars. I'll propose a time if I don't see something obvious in the in calendars.

**Speaker 2 | 15:19**
And if we need to speak there and you need me in that meeting, just let me know. I will jump in and happily answer questions.

**Wesley Donaldson | 15:28**
Yeah, it may be good just to assume you're going to be there, depending on what you come back with from refinement.

**Speaker 2 | 15:35**
Sure. The good news is a lot of this stuff is heavily, like, dependent on what Recurrly is doing, right? So what does Recurrly expect when you're submitting an order? We should be following that and then making sure that any of our more unique use cases. 
Like what if the purchaser is different than the person intended?

**Wesley Donaldson | 15:56**
Yes. I think most of this. Honestly, I expect this is just going to be application logic, not architecture conversation, because at this point, like, we're not doing the back end work yet. 
And that's really where like, okay, cool. Is there a web hoop that you're connecting into? But that's where that conversation would happen. That'sectural.

**Speaker 2 | 16:13**
Right, yeah, this should just be using the API to insert the ordering recurrly.

**Wesley Donaldson | 16:17**
Exactly. 
So.

**Speaker 3 | 16:29**
Sorry, how's everything going? The endor side and the P1.

**Speaker 4 | 16:35**
Almost turning phone back on now i'm just got a broken smoke test, but we saw this last week and it looks like a timing issue in production but not an actual fail. The test works fine and do. Nick, as far as I know, is still working on the email update.

**Speaker 3 | 17:00**
The log not a bug, that's that, that's Ray is working on that. Okay.

**Speaker 4 | 17:07**
So then the login issue on admin portal is getting resolved and Frman's still working on the status thing on portal. I've so got the dal que those queues that are full that got pushed out so I could deal with the other stuff. 
So I still need to deal with that once we've turned it back on. So that'll be.

**Speaker 3 | 17:27**
Antony who is responding to that? Is he looking into that at all? Wes, you know.

**Wesley Donaldson | 17:34**
I'm sorry, one more time. The only thing Antonio should be following up on is he wanted to find. How are we addressing going forward, like after something hits the dead letter queue, it expires after. 
I think it's four days. Like he was investigating what would be necessary for us to be able to reprocess the ones that have already expired after that four days.

**Speaker 3 | 17:56**
Okay, perfect. That's actually something that I really wanted to look at. So as what about just like fixing d LQS in general?

**Wesley Donaldson | 18:03**
And his approach from going back to the event door. That's not specifically a task that he's working on. I think I just need a little bit more detail on what, like this is one specific issue, like the expiration date and how to, like, address getting them back. 
If we go beyond the expiration, I think we have already requested the expiration be increased. I think he said 14 days. But this task is more about how do we. Even if we. If we go past the 14 days, how would we recover for that? 
That's what he's working on.

**Speaker 3 | 18:41**
Okay, sounds good. One thing that I talked to Francis about last week was working on getting the current blogging, like the alerting that we have coming to teams to be kind of in that alert pattern where we're expecting developers to like, turn it off so that they stop spamming us and so that we can see when things actually are like, starting to happen.

**Wesley Donaldson | 19:11**
Yeah, I have that as one of my task items for, like, bigger conversation. Like, how are we like kind of what Sam summarized, which we already knew this idea of like, there's too much noise when folks are not reacting to the alerts. 
Maybe that's a conversation we can bring to architecture. But if France is your proposal. That Francis change is going to meaningfully address that i'.

**Speaker 3 | 19:37**
Yeah, I think, it's something like. Basically, it's the way it should have been set up originally, and so him and I kind of talked through it because that's how I had kind of expected it from Choma. 
So hopefully it'll. Let's see how it addresses it. And if we want to go a different direction in architecture, we can. But otherwise I want to see how this works out.

**Wesley Donaldson | 20:09**
And the last thing I had and Jennifer we can connect offline. Like I was curious if there were any action items coming out of the last post mortem. It sounds like this is one of them. Most. More.

**Speaker 3 | 20:23**
Yeah, I don't know if we actually got any. 
Like, I think this is the only action item. I need to check and see if we scheduled any more work. I think. No, the only action item was bringing it up in an architecture meeting.

**Wesley Donaldson | 20:42**
Okay. And we're going to hold on that until after France makes this change and we see how it does.

**Speaker 3 | 20:49**
Yeah, let's see that. Okay, we've got a lot of other stuff for our AR.

**Wesley Donaldson | 20:55**
Then I will not join the 12:00 pm call in.

**Speaker 3 | 20:58**
Good. Okay, thank you.

**Wesley Donaldson | 21:03**
Okay? ALR guys. Thanks all.

