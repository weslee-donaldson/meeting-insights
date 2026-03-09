# LLSA, Recurly Product Review (final) - Mar, 05

# Transcript
**Wesley Donaldson | 00:04**
Good morning, team. Sorry about that. Who do we have? We have Greg the critical, we have engineers actively working on features that we wanted to get in for this morning, and we have your ELS. Okay, all right, let's jump in. Greg, apologize. I should run this by you, but I'm thinking maybe it'd be best for you to walk us through the flow as you're understanding, and we can feed into it just to give you the opportunity to get comfortable. Thoughts on that?

**Speaker 2 | 00:34**
Sure. Yeah. Just give me a second then to just pull it up.

**Wesley Donaldson | 00:38**
Sure, I can add the link to the chat. Just real quick, make it easy on everyone. This guy...

**Speaker 2 | 00:46**
And then into what it's gonna do. And then we. Poulper. I'm gonna poper Curly as well.

**Wesley Donaldson | 01:06**
I'm going to record just to make it all easier to get some notes out of this and keep my hands off the keyboard while paying attention.
Okay, we're with you.

**Speaker 2 | 01:25**
Alright, great. So, and I was probably going to most likely either, cast my mobile to my screen or potentially do it in the, do it in mobile view just because I think it's, you know, as you guys have heard multiple times, you know, 90% of our traffic is mobile.
So. So I think it gives a. You know, I think it's, the best way to be able to walk the board through this with that metric in mind. And so I either do it on my actual phone or. Or do it like this, you know, and just size down the window to a mobile like dimension.

**Wesley Donaldson | 02:05**
I'm not sure it's because we should be able to support both, but the majority of the testing the team used was this view, the mobile-responsive view within Chrome.
I know I've tested the experience on my phone, but I... Team members, do you want to speak to? If we've done an exhaustive around on physical devices...

**Speaker 2 | 02:24**
I test it on mine as well, if it's any consolation. So I play with you know, I went through the flow a couple times on my phone as well. But if there's any caveats or gotches or anything.
Yeah, please feel free to bring them up.

**Wesley Donaldson | 02:41**
It's probably one around... Jeremy, if you want to speak to us when we get to it, the add to calendar.

**Speaker 3 | 02:48**
Now, we get there, we can talk about that.

**Speaker 2 | 02:54**
Okay, so, and, I think I you know, I've seen Beth when she had done it previously. She'll do it in an incognito window. But I actually think it's, you know, I think actually allowing it to use my location is kind of a. Will be an exciting thing because it obviously, like, cuts down some of the friction, you know, of having to even go through the address entry.
But, you know, then I want to, while I'm in here, show them that I can, like, come in here and, you know, use a look ahead search. I can pull up address. I can look at, you know, city, state or I can just bring in bring up a, you know, postal code. Then, you know.

**Sam Hatoum | 03:41**
So it makes sense to share the auto search if you have the zip code in the URL.

**Speaker 2 | 03:48**
Yeah, and it loads it yeah, the fact that it just since I'd already given in access to my location, it will just auto automatically fill that in. Like this isn't even actually my address, but, you know, it's close enough and it just, you know, prefilled that based on the geo location, which I think is kind of a cool feature.

**Sam Hatoum | 04:08**
So I guess I meant specifically within the... You have the zip populated in the URL, so I think that'll be the standard for how they access the page. Yeah, I weigh fine, but...

**Speaker 2 | 04:25**
Yeah, because the effect is pretty much the same. But that's actually, you know, I'm gonna make a note cause I could. I could it may be worth bringing out.
And then from here. And so, like, mostly I just want to really focus on, you know, what's different. So, you know, here, I'll probably show, you know, that I can now select a date range, too.
Yeah, it looks and the loading looks good, so that's good. It does. It's AI think a much more. I think it's a much smoother interaction. Now I can filter then within that date range and then actually really get to, you know, hone in on something that's really convenient to me based on my by my time range. I'm not as, you know, just given the nature of the audience and everything.

**Wesley Donaldson | 05:29**
Understand.

**Speaker 2 | 05:30**
I won't be really getting into edge cases of trying to find places that don't have screening sites or anything like that.
So, I can do that. View... I think I'll probably show them the expanded map view as well. Actually, let me unselect that. Actually, I guess I can't unselect Tom. I can just select a different thing.
That's not a problem right now. I'm just thinking out loud, but I think that will be something I'll probably bring in later. So I guess before I select anything, I'll probably... So I guess I...
Before I select anything, I will show them the map view.
That works really nicely so that us second my time. Okay, so now we got this and all the pricing looks right and the design looks a little bit more up to date. A curiosity question for the group. Have you guys seen...? I don't... I saw that there had been some based on some of Beth's feedback, there had been some design updates in the Figma file. I don't know if anyone's incorporating in those yet. The only one that I feel like maybe would be worthwhile getting out when we can.
And it's a pretty minor thing. Would be there's one that has, like, just a change in the background color to the sticky, kind of cart piece here.

**Wesley Donaldson | 07:24**
Okay, I'll find that.

**Speaker 2 | 07:25**
See what I'm...

**Wesley Donaldson | 07:26**
I'll get a tick. An urgent ticket for us on the board significant.

**Speaker 2 | 07:29**
I can point you to the right place in the Figma file, too. Less if it helps.
But that's the one thing. Because I think that was just the one piece of feedback I'd had from the executive team, and I agree. I mean, certainly some of these things could probably be a little more visually differentiated.
But the main one is just this. In this navigation here particularly, I think they had brought up when you're in the appointment, and you can see you have Knights of Columbus and Trinity Lutheran Church, and it's... You start to lose the context a little bit.
So just something that we're just trying to think of ways... Again, this is not by any means a development issue. I think it was just one of those things that, when you see it in the Figma, you're like, "Okay, that looks pretty clear."
I think there's a drop shadow in the Figma. That's the only difference.

**Wesley Donaldson | 08:18**
Exactly.

**Speaker 2 | 08:19**
But even that, I think, probably wouldn't necessarily be a stark enough difference. So I think we're going to go with maybe a different background color to just give it more differentiation here.

**Wesley Donaldson | 08:31**
It's just CSS on that one. Just the wrong word. But I only see the drop shadow in Figma. Now, if you have someone from creative or they have a color in mind, if the... Or if you want us to take a stab at choosing a color, maybe grabbing something from the hex from the drop shadow.
But I don't see...

**Speaker 2 | 08:48**
They did one. So I'll find it for you immediately.

**Yoelvis | 08:52**
Yeah, it's in the main workflow, it's yellowish.

**Wesley Donaldson | 08:55**
Main work five check off.

**Speaker 2 | 08:57**
Yeah, that one.

**Wesley Donaldson | 08:58**
I see it. Yep. Okay.

**Speaker 2 | 09:05**
There are some different color backgrounds on these just... But, again, if you can get to it, great. If you can't, no big deal. I don't think it's going to make it that much of a difference.
So let's see now, let's add that and then that... Okay, so that was the one thing I did see last night, and I wanted to bring this up because I would say there's still an issue with the logic here, so maybe it... I don't know if this was not documented in a clear way or anything else.
So I can just speak through right now. The way that the membership discount works is if you just... I know it's a little confusing, but if you just have our basic heart and stroke WRSK screening.
Okay, like the standard package, and you add one life membership. Then what you should see is the first year's free because there is no discount. The discount is that $30 discount is only on any additional tests.
But what that means is if I add one of these packages, like if I add the chronic disease or men's and women's or complete predom care suite, then I actually should get a $30 discount. Or even... Similarly, if I'm on the next page here and I add one of these, I should see a $30 discount and a $30 discount.

**Jennifer | 10:30**
I don't think we're doing discounts yet, right?

**Sam Hatoum | 10:33**
Yeah. We have that setup on the back end but it's still stubbed out. I think the back end will give you a discount if you buy one of those individual tests with the membership, but I know for the front end, we'd been told to hard code the first year free for membership regardless of what they pick.

**Speaker 2 | 10:52**
Okay, is that just...? All right, that's fine. That's what you guys are told. I just wanted to make sure that... Yes, as long as the awareness is there and that's what the backend is doing, I don't think we're going to get...

**Sam Hatoum | 11:02**
Yeah, and keep in mind that the way that... You will see it recurrently but it sounds like even the backend is not in line. It will only apply if you get a membership plus one of these additional tests, not an upgrade.
So if you want to show that discount, it will currently make sure you get one of these individual tests with the membership. Okay. I thought it was just if you get a blood test along with the bit, but that's the last to be flushed out.

**Speaker 2 | 11:36**
Okay, yeah, we can work on that next week. But yeah, I think the idea is if you add anything because I think the idea then...

**Yoelvis | 11:47**
No, I noticed that is failing in the back. Now when you add a membership and you complete the purchase, we are getting an error that says something like the coupon is invalid. Something like that.

**Sam Hatoum | 12:04**
If we change the keypod...

**Yoelvis | 12:07**
Maybe something we need to address.

**Sam Hatoum | 12:15**
Okay.

**Wesley Donaldson | 12:23**
Sorry. Let's clarify that something we need to address today immediately prior to tomorrow's demo. Is that what I'm hearing? You're all... It's broken. It's not going to allow us to place the order and see the confirmation page.

**Sam Hatoum | 12:35**
Yes, exactly. It sounds like...

**Yoelvis | 12:37**
Yeah, I did a full over a full run through all the website yesterday we did on we noticed that and some other mismatches, but yeah, that may be the most important one.

**Sam Hatoum | 12:50**
Yeah, we removed the keypon that we were using. It looks like...

**Yoelvis | 12:59**
It's no longer... I'm going to share the screenshot in a minute so you can see it here.

**Sam Hatoum | 13:04**
The keypons... Greg sure. Looks like we updated these recently and the one that we were using the last week or so is no longer there. There is no expired.

**Speaker 2 | 13:22**
Okay, expired. So if I change the date of the coupon, we'll then work again.

**Sam Hatoum | 13:28**
We can just change what coupon we're applying. Okay, on the back end, do you know what? So can you scroll up? Maybe as well... I'll just check it now. One should read the message, they look pretty similar.

**Speaker 2 | 13:46**
Yeah. I'm trying to see if there's any difference.

**Sam Hatoum | 13:48**
But actually, I guess you're one.

**Wesley Donaldson | 13:51**
Can we propose we just make the admin change rather than even if it's a minor code change?

**Sam Hatoum | 13:51**
Yeah.

**Wesley Donaldson | 13:55**
If we can just bring back the old coupon and get back to the existing state of the functionality, that's perfect.

**Sam Hatoum | 14:03**
Be thirty-one, life three, I think, and there's double thread.
If you want to keep going, I can just drop it in the chat, the one that we're using.

**Yoelvis | 14:19**
Yeah, I just shared the air message that we are getting and that's the coupon that we are missing or is invalid. Over.

**Sam Hatoum | 14:29**
Yeah. Dash 3. So it'll be the second one from the top under expired just...

**Yoelvis | 14:42**
Yeah, I think it's just a matter of enabling that coupon and it's going to fix the issue.

**Speaker 2 | 14:48**
So, if I restore it...

**Yoelvis | 14:52**
If we want to use a different coupon, then we can just... I think this is something maybe we need to control with the API or something like that. Getting that coupon instead of hardcoding.

**Sam Hatoum | 15:08**
Yeah. Once we flush out the coupons and membership. Right now it's just hardcoded which we don't want, but there's not really another way to do it yet.

**Speaker 2 | 15:26**
So the one other thing besides... Then, obviously finishing the order that I was going to show and probably I was going to do it in this... I was actually going to probably start by adding this because one of the things that the board's particularly eager to see is just the ability to add new tests.
So what I was going to actually do is as part of this real-time demo, I'm going to add the... Is there any besides lowercase and underscores? There are no specific rules around code right that I need to... To my knowledge, there's nothing specific about code right that I need to...

**Sam Hatoum | 16:27**
I mostly have a DXH but I don't think we...

**Speaker 2 | 16:31**
So should I put the put do DX.

**Sam Hatoum | 16:36**
You can... Yeah, I forget. I don't think we have a gate, but...

**Speaker 2 | 16:42**
Okay. Then I think BET is just doing something like this. A man. I think it just needs to be active. Okay, so I've created PTAIL, and I probably should have started here because I think it might take a minute or probably five, but then ideally, you'll...
Yeah, we'll see. So if there's something else that, actually, you know, maybe I'll just finish up this transaction first, okay? And my cart still, that's good, everything kind of stayed there because I didn't change.
Yeah, there it is. Ready? It's great. Excellent.
And then finally, is there a test does anybody have a is there a test card that works for this.

**Speaker 3 | 18:04**
Or followed by all ones.

**Speaker 2 | 18:07**
Okay, so 41111.

**Wesley Donaldson | 18:09**
But you're all us if you want to just paste what you've shared a couple of times now. It'll be good... For you to show that validation's happening there like insufficient funds type level validation even that should be assumed.

**Speaker 2 | 18:25**
Yeah, no, it's good to have in my back pocket, as you know, just in case they want to get more granular. Okay, great. Let me stay to see this.

**Sam Hatoum | 18:36**
Okay. Okay, I just shared that.

**Yoelvis | 18:45**
Yeah, I had to do a few CCA SS tweaks to make that look exactly like the rest of the inputs, but those inputs are like iPhone are controlled by recording, so... No, this is not the one. This is not the one.
So... Precurli. This... This is this one, okay? Is the one I share now.

**Speaker 2 | 19:35**
Great, okay, yes, this is perfect. I just add a bookmark to this.

**Yoelvis | 19:47**
If you scroll down, you're going to see the card out.

**Speaker 2 | 19:50**
Here's a here's like some.
Let's try this one.
And does that have to be submitted first before do they have a standard, expiration of CBV code? Is that somewhere is the same one that's in the screen shot?

**Sam Hatoum | 20:27**
I think it could be any. And you cared as long as it's the expiration date is valid. If there can dispute two digits.

**Speaker 2 | 20:35**
Okay, are we, have we set up, autofil on any of these?

**Yoelvis | 20:49**
Yes, it's that's going to work. You have a feeling, yeah.

**Speaker 2 | 20:53**
I thought so.

**Yoelvis | 20:54**
Your browser or...

**Speaker 2 | 20:56**
I thought, yeah, I should, but let me see. Actually, let me just really quickly go on my phone again and see because I know for a fact on the issue work.

**Wesley Donaldson | 21:08**
If you right click it should show you this is Chrome, right? It should show you what profiles. And then if you have, like, an agent, like one password, that should give you the option there.

**Speaker 2 | 21:20**
Yeah, I do. I have a couple. So that's why I'm surprised that usually this type of stuff, you just...

**Yoelvis | 21:27**
For me, it populates automatically when you click it.

**Speaker 2 | 21:31**
Yeah, okay, yeah, I don't know, maybe it's just on this browser for some reason, because I don't necessarily... Since this is... I mostly use this computer for work. I might not have it. I just look on my one real quick, though.
Yeah, perfect. Okay, on my phone, no problem. So it just must be my... This browser.
Hey, Rinor. If I actually go and I do this right now, like I actually add different participant information, will it alter anything in the... When I see the after I submit and I see the confirmation screen, does it make any differentiation there between saying, "Bill, this is who it's billed to?"
and here's the participant just trying to recall what's there. I guess I could find out.

**Yoelvis | 22:42**
Yes, it's going to show you the participant information, okay? It's going to use the billing one just for billing.

**Speaker 2 | 22:50**
Okay.

**Speaker 3 | 22:52**
You can press the button here. I left that there. I forget what the ticket said. But if you press the calendar button to the right, you can just select it with a regular calendar UI and to write it 2.

**Speaker 2 | 23:18**
Right? So that one should get rejected, and we'll see. Perfect. Okay, then I'll do... Then I'm going to do my actual accurate one.
In this case, I'll create a separate...
We don't have any birthday restrictions or do we? We do, actually.

**Speaker 3 | 24:26**
Think it's 21 or that's what it originally was when we had started looking at the Figma. Okay, yeah. So let's do that. Alright, let's... Okay, great.
I had the calendar button when I was researching it. So what the calendar button does is it downloads an ICS file. Yeah. So if you open that file, or you find it in your downloads or whatever on your machine, and then you go to Outlook, you can drag and drop it, and it'll show up.
When I was reading documentation, it claims that 99% of phones... If you're on a mobile device, it'll open up that little overlay, and then you select which calendar you want. Or if you have a default one, to open that and put it there.
But it is possible that it might not work on certain devices. But that's not necessarily something that we control. It's reliant on your device whether or not they have a default calendar app, stuff like that.
But in theory, if you're on a mobile device, they'll just prompt you to open up your calendar app and then put it there. Right now, it's set to an hour-long appointment schedule. The duration that it'll show in your calendar is an hour long.
I know when I was asking Beth about it initially, that's not always the case. I believe they can be shorter or longer or something. So, in the future, we might have to add some extra logic to make sure the duration is right.
But for now, that's just the blanket duration.

**Speaker 2 | 26:14**
Yeah, I think that's fine. I think that's good as a blanket duration. And actually that yeah, this type of thing like the ICS files work really you usually work really well on Ma, you know, like where it's just to just instantly.
I mean, this is not my it. Yeah, this isn't my standard calendar, but it did just automatically add to the, you know, the native Mac calendar.

**Speaker 3 | 26:36**
It worked well. Well, yeah, I'm only on a Windows machine, so I can't really test it on anything else.

**Speaker 2 | 26:44**
Yeah, that's really good.

**Jennifer | 26:46**
For the discounts. Is there a different way? We want to hardcode that before, like the demo tomorrow, like, quickly, just to make it look right before we actually, like, code anything into it.

**Sam Hatoum | 27:14**
I mean, right now, it's... Because it's going to say 3 on the previous pages. It's going to say -30 on this page. Because the logic is a little bit different.

**Speaker 2 | 27:26**
Yeah.

**Sam Hatoum | 27:26**
It's not actually going to apply recurrently because the coupon that is getting applied does not apply to the new product that you just added. So there's some...

**Speaker 2 | 27:38**
Ross around. Do I find is my should I see my order under px under account or invoices.

**Sam Hatoum | 27:49**
By the council, show you... Okay.

**Speaker 2 | 27:54**
Yeah, so here is... Okay, and we... That's cool. We see the parent-child.
Okay, but it's good that we can see then because of the add-on, it's added the 1806, it's a recurring charge. What goes into the child one? I'm actually curious. Interesting.

**Sam Hatoum | 28:39**
Okay, the child will show you the membership, and then again, this is weird, but you will see the coupon further down. I'm still in an active state because it didn't get applied, and that's because that coupon was set up only to apply for two products.

**Speaker 2 | 29:00**
Gotcha. Okay, so as long as I add one of those... Or do you mean that I have to literally only have the two products? Or do you mean if I add one of those two products that applies to...

**Sam Hatoum | 29:15**
One of the two? I forget which they are, but I figured as a coupon, it'll show how it's configured. Okay, so it's on there. It's your vitamin D or colon.

**Speaker 2 | 29:31**
Okay, so if I had one of those, I should be able to then see at least on the back end. I should be able to see the discount. Ye great. Yeah, I think. No, I think this looks. I think this looks good. I don't think I really have. Any comments besides that?
You know, some that light styling that I brought up and then ums.

**Wesley Donaldson | 30:05**
Sorry. One item that I recall on the confirmation page. I recall a conversation last time about the number that we were showing there, the order number has Ellis, something that's in the middle of the page below the calendar.
I think we had talked about pulling the invoice number. I guess my concern there is just if multiple people go through it, they may see that number not changing and think that that's not hydrated or we're not able to pull that. I think that was Bett's concern.
Do we want to create just reading the invoice number or something like that? Does anyone recall this conversation?

**Speaker 2 | 30:42**
Yeah.

**Yoelvis | 30:42**
I believe right now it's hard-coded and we should fix that and pro... I think the... What I recall is we wanted to use the invoice ID star lens. I don't remember.

**Jennifer | 30:59**
We could do something like ls 2026 dash and then the invoice ID so it looks longer.

**Wesley Donaldson | 31:01**
And I.

**Jennifer | 31:06**
But it's really just that five-digit...

**Wesley Donaldson | 31:14**
It would be good optics-wise, I think. Grey. Because I know I'd be looking for... Well, that should be changing. I'm a different person. It's a different order.

**Speaker 2 | 31:21**
Yeah, I agree.

**Wesley Donaldson | 31:25**
Okay, right. So then I go ahead.

**Yoelvis | 31:27**
Okay, no, I just wanted to say that in that confirmation page, the phone sizes and everything are a little bit off. They are huge font sizes. Yeah, we noticed that and some other details yesterday we Devon and we are carrying some UX tickets for those details to align to the latest designs and one sizes and everything.

**Speaker 2 | 31:55**
Great. I am noticing one other thing too. I'll bring it up which is that this is not right because this is today, Thursday, March 5th. This is for Monday, March 9th, and it's saying it's in three days.
So however this is being calculated, I don't know if it's... I was going to say it's time zone, but now I don't think there's any time zone where this should be the case unless we're using GMT or something. I guess probably...

**Jennifer | 32:26**
UTC.

**Speaker 2 | 32:28**
Yeah, maybe.

**Yoelvis | 32:28**
This is round in North.

**Speaker 2 | 32:32**
No, round. Yeah, rounding. Yeah, I was going to say it's probably one of those things because... Yeah, it should be.

**Sam Hatoum | 32:37**
Because we marronize at midnight and then UTC makes it like march8 at seven o'clock.

**Speaker 2 | 32:44**
That's what I was wondering.

**Yoelvis | 32:48**
Yeah.

**Speaker 2 | 32:49**
I don't know if anyone will, you know, I don't know if any anyone will have that keen of an eye as I'm going through, but if I guess I would just add it as a as one of the like a defect.

**Wesley Donaldson | 32:58**
Two. So as far as the critical ones or the ones that we want to work on immediately, the styling around the fixed position footer for the summary of the card, we have the order number on the confirmation page. We have minor styling on the confirmation page, and now we have the date and time on the appointment listing page or the screening page.

**Speaker 2 | 33:29**
Yeah, but otherwise, I think this looks outstanding. You guys knocked it out of the park.

**Yoelvis | 33:34**
What do you think? One thing we noticed is that if you modify the search and you search, for example, "Los Angeles," it's going to display... Can you click it? You will see it's going to display this whole full address, and I was expecting to see just Los Angeles.

**Speaker 2 | 33:56**
A good catch what is where yeah, where is this? I wonder how I think.

**Yoelvis | 34:00**
That's the central location in Los Angeles that is used. So we don't need to display that. I believe we just need to display whatever we want in the drop-down resolve.

**Speaker 2 | 34:12**
That would be ideal. Yeah, if you put... Actually, I'm curious, if I put in a zip, for instance, what it's going to do with that, probably something similar, but let's see. No, actually, this is more...

**Yoelvis | 34:24**
Like what.

**Speaker 2 | 34:24**
Yeah, this is what I would have expected, but for the city state. Interesting. Yeah, that would be good. Yeah, I think that would be... I mean, obviously, if it's a stretch, I can avoid it. I can just not search city state while I'm doing the walk-through, but ideally we want to do that.

**Wesley Donaldson | 34:47**
We can open... So Jiffco owned that implementation. Unfortunately, he's out sick today. Basically caught what his daughter had yesterday. I can... We can open the ticket and if an engineer has... You're all... This is if you want to take a look at it and see. You have one other ticket.
I think that's on your plate. That's pretty urgent. But we can assign it out and see if we can get it resolved today. But it may take a little bit longer just because the engineer who owned that feature is not able to quickly jump on it.

**Speaker 2 | 35:16**
That's fine. Yeah. Yeah. Because. Again, like since I'll be, you know, since I'll be driving, I can just not do that.

**Wesley Donaldson | 35:23**
We'll try to get a few systems right there.

**Yoelvis | 35:23**
Yeah, we noticed that yesterday as well in our session. But yeah, it would be interesting if you opened the map. It's going to display New York, not the whole thing.

**Wesley Donaldson | 35:30**
Okay.

**Yoelvis | 35:37**
You can see they're near New York at the top.
I think that's... Yeah. On Nick... Nick did some replacement in the day to make this shorter here, but... Yeah.

**Wesley Donaldson | 35:49**
So let me summarize here. Whenever the user searches for either the city name, the state name, or a zip code, it should all go back down to just showing city and state. We should not...
For example, when the user searches for a particular city, we should not try to default it to a full-qualified address in the center of that city.
Greg, I think I have a sense of importance here. But if you can give me your top three... I really want this clear to the foot is one. What's your other top two?

**Speaker 2 | 36:35**
Yeah. So the footer would be one.

**Wesley Donaldson | 36:42**
Order number? Maybe because of just cementing the idea that it's a different order within the user's mind.

**Speaker 2 | 36:48**
Yeah, I think so. I mean, again, like I don't there won't be different people testing it, so they won't get to they won't even have a sense of that. But I think if it can be done, I would put that second.
Then, yeah, I mean, I like... For tomorrow, the really... I'd say that's the only really critical one. Then, yeah, then I would just do that navigation stuff or... Sorry, the confirmation stuff.
I think that pretty much be it, because I think if I understand correctly from the chat this week, doing anything with the discounts would be too complicated at this point. So actually being able to show, in the interface, if I add a second test, even if it's one of those tests from... What was it? Vitamin A, like Vitamin AI, still wouldn't be able to see the negative 30 because it's not dynamic, it's hard-coded.
So I think if that one's too much of a stretch, I'm not too worried about it.

**Yoelvis | 38:05**
I have a quick question about packages. Can you open packages? When do you want the user to select the radio button exactly? Or selecting the type?

**Speaker 2 | 38:20**
Great call. And they be able to they should be able to click anywhere on the box ideally and it will select. Yeah, actually good catch.

**Yoelvis | 38:31**
Yeah, we can do that. It's like, straightforward.

**Speaker 2 | 38:34**
Yeah, I guess I was treating this whole thing...

**Wesley Donaldson | 38:35**
Sorry. Just whenever we click on any area within the box, not just the radio button, we want that to select.

**Yoelvis | 38:44**
You all...

**Speaker 2 | 38:45**
Yeah, except for "View all," which obviously should show, but otherwise, yeah, this whole thing should... It's almost... It should be treated like a button.

**Yoelvis | 38:55**
Yeah, it's hard because it's hard, you know, when you are in a mobile phone, just to hit that specific spot.

**Speaker 2 | 39:05**
Yeah, exactly.

**Yoelvis | 39:12**
Especially your target demographics are there are more like seniors, but yeah, they don't have that precision probably. Exactly.

**Speaker 2 | 39:21**
Yeah.

**Yoelvis | 39:21**
That's good.

**Speaker 2 | 39:23**
No, this is great, guys.

**Jennifer | 39:27**
So other than those few design front-end changes, we should probably be doing a code freeze. I'll let the other team know as well so that we leave everything as you're expecting it.

**Speaker 2 | 39:44**
Yeah.

**Sam Hatoum | 39:46**
So I think vice might be pseudo dynamic right now it looks like it's ls h te dash perhaps the year. And then we're using the guid, the appointment guid, like the last portion of it. So it's not it has nothing to do with Curly's invoice, but I do think it's pseudo radom.

**Wesley Donaldson | 40:15**
Just to reduce the surface share of what we're touching. I would say if it's pseudo-random, it's not the same each time.
I think we'd leave it... My opinion. Do you think, Greg?

**Speaker 2 | 40:25**
Yeah, I think we leave it.

**Wesley Donaldson | 40:38**
Any specific data conditions you need us to set up for you to trigger? I don't think there is... Else where we normally need any known issues.

**Yoelvis | 40:44**
No, good for me.

**Wesley Donaldson | 40:48**
Team that we want Greg to avoid like the plague. No non-issues.

**Yoelvis | 40:59**
I just have some ideas for... Ways to modify the button to make it slightly better to avoid orphan accounts and some other things, but we can tackle that after the presentation.

**Wesley Donaldson | 41:17**
What time are you...? If you're comfortable sharing, great. What time are you presenting? Just so I can have the folks...

**Speaker 2 | 41:23**
Yeah, it's going to be a little bit... So it basically... It's going to be from the meeting itself. It's going to be from about 08:00 am to about noon tomorrow. Yeah, so I think I don't know exactly when I'll be. How about this? How about if we just are we just freeze as of like, 08:00 am Easter and tomorrow?

**Wesley Donaldson | 41:55**
Yeah. No commits against me. Basically, like we can war.

**Speaker 2 | 41:57**
Yeah, and then I'll just drop a and then when I'm done, I'll just drop a note in general saying you we can, you know, you're free to start deploying again.

**Sam Hatoum | 42:11**
We want to do sometime today instead of eight. Am we accidentally push something tomorrowg?

**Wesley Donaldson | 42:19**
It's a good point.

**Speaker 2 | 42:20**
Yeah, probably. End of day to today would probably be the safest bet.

**Wesley Donaldson | 42:27**
Okay.

**Jennifer | 42:28**
I think as far as code freeze goes right now, we just showed everything other than those ones that we talked about. I think we could freeze everything else, if any, unless anybody else has a disagreement with that, as of now.

**Wesley Donaldson | 42:48**
Actually, that's a really good point because since we're using a monorepo and since we are pushing against main, not from a feature...
Yeah, I think it's a great call.

**Speaker 2 | 42:58**
Okay.

**Jennifer | 43:02**
Sounds good.

**Wesley Donaldson | 43:04**
That's good, folks.

**Speaker 2 | 43:06**
All right, great, thanks so much. Thank you. Appreciate all the hard work, every way.

**Wesley Donaldson | 43:07**
Perfect timing too. Right, guys? Good luck on the demo. Tomorgry. By now.

**Speaker 2 | 43:16**
Okay, thanks, thank you.

