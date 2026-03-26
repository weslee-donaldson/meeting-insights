# LLSA, Jeremy 1:1 - Mar, 24

# Transcript
**Wesley Donaldson | 00:02**
I will make this quick, give you one more because I have to jump into a meeting at 01:00.

**jeremy.campeau@llsa.com | 00:04**
And no worries.

**Wesley Donaldson | 00:10**
All right, so this right here. So yeah, we I think got a good direction yesterday on what we want to accomplish here.
So now we have events coming into event grid. Great. The part that I think is... We didn't explicitly address is here. So right now you've coded support for order placed. However, now we're talking about two core events coming into the system. One is the subscription renewals.
So subscription renewals will get dropped on Event grid as well, and the expectation is your API is going to handle both. Are you aware of that?

**jeremy.campeau@llsa.com | 00:50**
Yes, I'm aware of it as of yesterday in that integration meeting. That's all I know. Just what you were saying in the meeting the other day. So barely aware.

**Wesley Donaldson | 00:57**
Okay, all right, cool. So, I'll get you a ticket for it, but I think the reasoning here is pretty straightforward. I guess the implementation is if the thinking is creating and I assume it's not creating a new API, I'm... I'm expecting it's creating a new handler for that specific type of event.
Then that could bridge off into... There is already work that the end or team is doing. I think the worry that I see is like whatever we do here may conflict with what they are doing.

**jeremy.campeau@llsa.com | 01:30**
Yeah, I can take a look at that, because I know, like I was saying yesterday, we do have event names. It's not just data. So we should be able to just be able to say like, "Hey, this one is order.placed or recurring order placed, call this function then for the work that they're doing." This is the event type. What is it? Renewal?
You know, have it go that way. I mean, definitely we'll have to write tests around it because this is a new thing. But I think the actual implementation is... It should be straightforward if I'm remembering how it's set up correctly.

**Wesley Donaldson | 02:07**
Yeah, that's good. We feel it's straightforward. I think my worry is what is it? 08:20 where is it validated? Send as... Sheer point.
My worry is there's already work being done.
Most of these are... Only thing that's important is all member accounts from production to recurrently thrive. So this task we're doing, and all the other tasks look like they're in process or basically validate new members listener. Actually, no, this will be it. This should be the listener I expect.
Okay, not clear on what that is, but all right. So I think what I want to do is maybe a quick conversation with you and David, just to... Jennifer, just to be like, "Hey, here's who's doing what, what are the boundaries between the two different teams?"
For me, it's clear that we are responsible for getting the data into Krisp, but then they are responsible for doing something with that event. Sorry, we're responsible for getting the event on the event grid, but they're supposed to be responsible for doing something with it, which means it wouldn't live in your code. Which is a bit of a gap between what we discussed yesterday.
So that's the part that I'm unsure about.

**jeremy.campeau@llsa.com | 03:16**
Okay. Yeah, I can add something because I'm just about to put up my PR. I'm just having Claude do some quality checks on it. But I can add something to make sure that it's explicitly calling the function I have.
Only if it's that order dot place or whatever. I'll talk to Lance about it. So that way if they start adding something, it'll be obvious like, "Hey, if they need to add code to this API, there's a pattern in place."
Then if they need to call another API in our system, then they can do that or do whatever. But I'll make sure that I kind of put that pattern there if that's works for now. I mean. Is that kind of what you're looking for right now?

**Wesley Donaldson | 03:50**
That now? But I think there's still we still just need to have a conversation with them. So, like, have you worked with David before that?

**jeremy.campeau@llsa.com | 03:55**
Okay. Yes, yeah, we worked closely on the Shopify integration, and so did Ferman. So we've all three of us worked together, and I saw both of them were on tickets for the things, so they're familiar with this API setup and the event grid stuff for Shopify.
So, yeah, we're familiar.

**Wesley Donaldson | 04:14**
That's great. Let me add you to a conversation, include history from the past, number of days, include all history, what do I care? All right. So I just added you to a chat. Adding... Jeremy, can you please share your thoughts on the changes we are making on ECOM 3 API to support the downstream post event grid for order...? What's it called? Subscription renewal. Subscription renewal at David. Can you please confirm?
If that approach works for you and if or tickets already cover how to handle the event once it's an event. Thank you for listening while I type. You've been great.

**jeremy.campeau@llsa.com | 05:35**
It's all good. Now I got it auditorily, and then I'll read it, and hopefully, I can add something good to the conversation.

**Wesley Donaldson | 05:42**
Nice. All right, yeah, so let's just have that there, let them bless that, and then we should be good.

**jeremy.campeau@llsa.com | 05:48**
Okay. So you just want to make sure that we're all working on the same goal. We're all aware of who's working on what.
That's it.

**Wesley Donaldson | 05:53**
Exactly. That's my big worry across two teams, and they're from when I spoke to Jennifer. They're supposed to handle it after we have the event.

**jeremy.campeau@llsa.com | 05:54**
Okay, yeah.

**Wesley Donaldson | 06:00**
Great, but our conversation yesterday changed that a little.
So I want to honor what we discussed and agreed to as a team, but I don't want to step on anyone's toes and end up in trouble. And I... There's work already done. I don't want to redo that work, and I don't want you working on additional work that's already been taken on.
There are a few other things that you can jump on.

**jeremy.campeau@llsa.com | 06:22**
Okay, I'll look at that conversation, re-read through it, and then say something in it.

**Wesley Donaldson | 06:27**
Tea. Thank you. I sir, I forno seen a bit.

**jeremy.campeau@llsa.com | 06:29**
Have a good one.

