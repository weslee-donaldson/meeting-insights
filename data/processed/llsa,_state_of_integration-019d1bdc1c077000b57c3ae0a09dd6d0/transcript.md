# LLSA, State of Integration - Mar, 23

# Transcript
**Wesley Donaldson | 00:04**
Good afternoon.

**Yoelvis | 00:08**
Hey. Good afternoon. How are you?

**Wesley Donaldson | 00:11**
It's Monday. Cannot be great, but cannot be horrible. All right, I see Xolv has joined. Excellent, right on time. All right, I threw some stuff into the meeting invite just to give us a good jumping-off point. Some of those are optimization.
Maybe we leave that to last. Or you all this... If you want, we can literally just open the Figma, put it on the left and right, and then just start going through. Or we can tackle the two items that we had parked on the board.

**Yoelvis | 00:49**
Let me see. What are the two items?

**Wesley Donaldson | 00:51**
Yeah, my preference is we just knock those off so we can clear the board for them because they're known issues. I can share my screen. Hold on.

**Yoelvis | 00:58**
Alr.

**Wesley Donaldson | 01:06**
Okay, so we have two defects or leftover defects. One, this one that Germany was attacking. The last thing I saw in the notes was just around the same as billing. I'm guessing this is a bigger ask because I... Because that's going to require functionality based on that checkbox, so maybe this is not a good... Yeah, let me copy the link over.

**Yoelvis | 01:24**
But's the... Okay, let me see. I want to understand this.

**Wesley Donaldson | 01:30**
So we have in the chat...

**Yoelvis | 01:44**
Is this an ongoing issue post?

**Wesley Donaldson | 01:46**
It's pause.

**Yoelvis | 01:46**
Okay.

**Wesley Donaldson | 01:47**
Yeah, and the reason why it's paused is just deprioritized. This one, I think, is more akin to an actual UI tweak that fixes UI. I think that's a better fit for this scope of this meeting... Well, so remember I renamed the epic.

**Yoelvis | 02:03**
Yeah, because I don't know what's missing in the same in that flow. This is an enro ticket. The 1bb6 is one now I shallw your.

**Wesley Donaldson | 02:23**
But 661 was posted after the NVP presentation to the board. So all of these items in theory should be completed before we go to production.

**Yoelvis | 02:49**
No, I see something here as well in the... Something that Stefan mentioned and it's not... It shouldn't be like that other ticket. I want to say that one... Be before we make some changes. Stefan mentioned something that I said that we should not follow.
It's a bad practice in general. Maybe I need to answer that one. Isn't it a comment? He's saying what is... Explain that the complete purchase should be disabled. I mentioned that it should not be disabled, it should be enabled.
When the user hits the button, if there is an error, we scroll to that section. Because having a button disabled is a bad experience in general in UX because you want to discover what's there, or you don't want to figure out why the button is disabled.
It's better just to let the user know exactly what's going on and why it's disabled.

**Jivko Ivanov | 04:01**
I personally very much agree with that. I actually have seen both behaviors. You and I have always been more frustrated by the disabled because then I have to figure out what I missed. But when I click it and get the red thing or the prompt, this is like, "Okay, I missed this stuff."
So I agree with that.

**Wesley Donaldson | 04:22**
I agree as well.

**Jivko Ivanov | 04:23**
Now.

**Wesley Donaldson | 04:24**
I think the only time we have a disabled button is when we're trying to prevent the user from submitting the final order. How does that relate to this?
But because this is the same complete purchase button, so do.

**Yoelvis | 04:37**
I mean, we are preventing the user already. If there is an error, the user is going to see the error and we'll have to fix it before we move forward. So we are preventing the user, but we are not preventing the user from clicking the button. Clicking the button should be okay.

**Jivko Ivanov | 04:56**
Yeah, I think the button should be disabled only after it's clicked and processing starts with no error.

**Wesley Donaldson | 05:02**
Exactly.

**Yoelvis | 05:03**
Exactly. Exactly.

**Wesley Donaldson | 05:05**
Okay, cool.

**Yoelvis | 05:05**
That's what we are doing.

**Wesley Donaldson | 05:05**
So I think the only thing you of us... I think we're comfortable if you just want to say, "Hey, this is the direction," that would be fine with me. I would say this bit of feedback here. Spoke to Beth, confirmed that the checkbox for... Confirmed that the checkbox for blah should be checked by default.
That's the part I would say is if we don't have that behavior, that's a task. But as I said before and I apologize, I should not... Is on the list.

**Yoelvis | 05:32**
But I mean, the and the other thing that Stefan mentioned is okay, it's not participant info.

**Wesley Donaldson | 05:33**
Like I agree.

**Yoelvis | 05:42**
We are not saving that in local storage, so that's not a gap, that's a feature.

**Wesley Donaldson | 05:49**
Yep, don't store PI unnecessarily. So that's a non-issue.
So then I guess the only thing that is left then is this guy.

**Yoelvis | 05:59**
Okay, let me see the Jeremy one. Yeah, that's checked for the fall, so it isn't... I think it's checked by the fall. Yeah, I implemented that one, so...

**Wesley Donaldson | 06:15**
Okay. Well, then that answers that question. We can just put this in done.

**Yoelvis | 06:18**
So for me, all the questions... But maybe you can just clarify. What Stefan mentioned is not valid anymore.
It's okay for the button to be disabled, and we are not storing the participant info into the local storage.

**Wesley Donaldson | 06:39**
We are not storing any participant info in the session storage. It's intentional. There is no PII storage. That's one. We confirmed the button's default state as the same as billing. What else did we do? We verified that this is existing functionality.
So it's working this way. Now that's a question that we need to address.

**Yoelvis | 07:21**
Right now it is working as I expect, but he's he mentioned some mismatching requirements. Those requirements may be outdated, probably because we were having a lot of conversations and, you know, we don't always update the requirements.
And I don't know why Jeremy is asking that. It's March 13th, but the SE of billing is. I think this is probably a ticket that was written, you know, before.
Yeah, Jeremy question Jeremy's question was before like all those things were before we implemented that so those things are probably outdated.

**Wesley Donaldson | 08:16**
Okay, that's good. So, no change here. Everything is working as we... I would say this is completed. We have a note on it. We can close it. All right, this one actually has a minor...

**Yoelvis | 08:32**
Yeah, the one that...

**Wesley Donaldson | 08:37**
What's the...? Let's go one by one. Order summary line items on the checkout page. Not bold like design.
Maybe I can hand it to you to present. We can just maybe have the Figma and tick it up.

**Yoelvis | 08:53**
Perfect, yeah. Then give me one second to set up the environment. Is this 01:10 okay?
Do you see both left and right?

**Wesley Donaldson | 09:36**
Yes.

**Yoelvis | 09:38**
All right, so yeah, we can... Send me the... Okay, I have the link here just to see if we are not duplicating the same issues. Okay, this is all this. Okay, this one is for Jeremy. I already implemented this one. The issue is that it was not live for whatever reason.
Maybe it was a deployment issue or I don't know, but let me double-check just very quickly. This one is in the second step. Okay.
For the summary selected BS.

**Wesley Donaldson | 10:31**
Okay. I'm going to move that back to ready for prod so we can know what we need to present back to Beth.

**Yoelvis | 10:47**
Yeah, none of the fixes here were deployed. Probably I don't know what's going on because this PR was merged. Do you have an idea? This was merged, but I don't see the changes in the...

**Jivko Ivanov | 11:05**
So I remember Lance talking about that the sandbox. I think you need to change the legs or something on the dev environment. So the sandbox is not pointing always to what we merge to main, but maybe changing the legs. Lance was noting that before.

**Yoelvis | 11:24**
Okay, let me try that in the dev environment.

**Jivko Ivanov | 11:28**
Yeah, because we have blue green on deaf as well, but I think the legs are not changed automatically. Well, no, they're not changing automatically on politics, actually, maybe they. I remember some discrepancies that Lance was mentioning.

**Yoelvis | 11:43**
Let me see, last time it wa it changed was thirty minutes ago, so I don't know why.

**Jivko Ivanov | 11:49**
Yeah, but is that OD or...?

**Yoelvis | 11:54**
Good point. Let me see how I can... Where can I see that? Maybe if I can...

**Jivko Ivanov | 11:59**
To click on it, maybe if you click on it, you say somewhere. Let's see.
That's no development traffic. Development traffic switch complete and well, that's the let's see domains. Let's see the domains.

**Yoelvis | 12:26**
MSCANT figure in dev is not as the problem.

**Jivko Ivanov | 12:31**
Yeah, you can switch.

**Yoelvis | 12:34**
Let me switch dev just in case it works. And I can go here and remove the cookies.
This is very fast.

**Jivko Ivanov | 12:53**
So yeah, it's yeah, fail fast. Yes.

**Yoelvis | 13:25**
I see this "Invalidate" we don't need to invalidate the cache if we handle this properly, but that's a separate conversation. Yeah, because if we have the proper headers in the index set ML we don't need to validate the cache. The headers will say in the SL set ML will always go to the source and the rest of the bundle can be cached. Whatever... No need to invalidate, but okay, let me go back here.

**Jivko Ivanov | 14:05**
You may want to do a hard to set you.

**Yoelvis | 14:10**
Yeah, I did remove the cache. Let me try that as well.

**Jivko Ivanov | 14:25**
Yeah, the heart a lot.

**Yoelvis | 14:48**
Alright, let me move it a little bit faster, but what happened here broke it.

**Jivko Ivanov | 15:00**
Man, you broke it. Now we need the money to fix it.

**Yoelvis | 15:13**
This is not expected. If I go directly to the appointment it's failing. What? Okay, this is not good.

**Wesley Donaldson | 15:25**
That's another...

**Jivko Ivanov | 15:26**
You can check the con yeah, you can check the console if there is any error there.

**Wesley Donaldson | 15:26**
But could you please?

**Yoelvis | 15:32**
Yeah, I see, but this is not good. No, it's not good.

**Jivko Ivanov | 15:36**
No buen.

**Yoelvis | 15:38**
It's not good. Yeah, no, but no do you see the console?

**Wesley Donaldson | 15:40**
Yeah.

**Yoelvis | 15:41**
Let me just stop you and share. I'm sharing the whole... You need to share the whole screen. Four or four, not four. Okay, this is an issue. Let's try to fix it at some point.

**Wesley Donaldson | 15:59**
So hold on, let me just make sure I'm that like when we hit appointment directly, we get a 4:04 error.

**Jivko Ivanov | 16:00**
But...

**Wesley Donaldson | 16:05**
If we just type in... If we lose the appointment off, it redirects to the appointment route anyway.

**Jivko Ivanov | 16:12**
How is that possible?

**Yoelvis | 16:16**
Okay, if you remove this, it's going to redirect to the appointment, but if you go straight to the appointment it's failing or if I refresh the page. It used to work, so it's probably something we broke recently. It was working fine because I used to refresh this page, but now when I refresh it's failing.

**Wesley Donaldson | 16:37**
Okay, hold on, let me get that screen graph.

**Jivko Ivanov | 16:38**
Same here, it just to work here.

**Wesley Donaldson | 16:45**
All right? Got it?

**Yoelvis | 16:48**
That's a very simple fix. It's just something happening in the routing. Okay, let me try this because this is the most... See equality... This is a problem because this is what we expect from the users to come this way. This is an important problem because we need to support...
You know, when the user comes here, they are usually coming with a ST call because they are referred from the home page, live line, and screening home page. In that home page, you write the T call and you hit the button and it's gonna open this with that zip code that used to work, now it's broken. Let me try this, for example.
So let me see the... Okay, here. This is looking great, right? Available in screen times. I noticed this detail, it's not super relevant, but it's something I've been noticing for a while. It's like this drop shadow here in this section is not here. Here is just a solid line.
Do you see it?

**Jivko Ivanov | 18:12**
I see it. Yeah, he won't really pay attention to that part, but yeah.

**Yoelvis | 18:21**
Yeah, this is a drop shadow here, so this section is elevated, but here is just a line.

**Wesley Donaldson | 18:31**
So sorry, hold on. The goal of this session is for us to fix it in real time, so I guess who is fixing in real time? Jeff, are you clear where that is? Is that something you can just start building around? I can create a generic ticket for us to throw our stuff in.
But the goal in this session is not just to identify them and create more random tickets. It's just to fix them in real time.

**Jivko Ivanov | 18:54**
Okay, I do get that. I'm... Yeah, not fixing anything right now. I think we're just reviewing because we have at least two issues so far, right? One with the routing potentially, and yeah, any other one just error.

**Wesley Donaldson | 19:04**
That one I got. That's bigger, so...

**Yoelvis | 19:09**
Here maybe we can... Okay. I don't know what's simpler, but I don't think we are going to have time.

**Jivko Ivanov | 19:15**
Yeah, to fix in real time.

**Yoelvis | 19:17**
To go through everything and fix in real time. But we could try if you want, but we may need more time. Probably.

**Wesley Donaldson | 19:25**
Let's go through. I'll write them in the chat and then we can... If we can, great. If not, I'll put a ticket in for... So just summarize for me what we just touched on. Sorry. I was writing up the appointments ticket.

**Jivko Ivanov | 19:41**
So no drop shadow at the header.

**Wesley Donaldson | 19:44**
And the head.

**Yoelvis | 19:45**
So the appointment, the URL 1 or this detail with the UX.

**Wesley Donaldson | 19:50**
The UX.

**Yoelvis | 19:52**
Okay, I understand. Small details. I think we can go through all the details probably and I can spend some time fixing them, but I don't think we will have time to walk through everything if we try to fix it at the same time.

**Wesley Donaldson | 20:01**
2FA. So where's the drop shadow here? I don't see it.

**Yoelvis | 20:21**
Let me... Space you drop shadow. Okay, this thing here, this button... Okay, this is looking good. It's not... I am not looking for exactly the same in some areas, like small details, it doesn't matter, but some of them do, so I just noticed here, for example, this doesn't matter to me too much, but this one is gray, the background, this one is white.

**Wesley Donaldson | 20:53**
Hover over that. Well, is this a failure in Figma because the hover effect is gray and the standard effect is white? That looks correct.

**Yoelvis | 21:04**
Hober I see.

**Wesley Donaldson | 21:05**
The hover is what's gray. And it looks like the Figma. Like.

**Yoelvis | 21:08**
Okay, never mind. Yeah, never mind. Yeah, because it's a good it's. I prefer to have it as a whole affair rather than y always there.
Alright. And this is a kind of ball and this one isn't. But I don't think that's important either.

**Jivko Ivanov | 21:30**
Because this is actually better to be bold. It's more visible.

**Yoelvis | 21:36**
Something I noticed is when you click this button, it's searching again. But if it's selected, do we need to search again?

**Wesley Donaldson | 21:47**
I think it's a good...

**Yoelvis | 21:47**
It's no.

**Wesley Donaldson | 21:50**
Hold on. When you click the soonest available button, it attempts to search again. It should just load from state.

**Jivko Ivanov | 22:06**
So let's talk that through a little bit though. Let's talk that through a little bit though. Every search means we get more fresh data. Like if an appointment is taken, we will get that. So I think this is a good behavior.

**Yoelvis | 22:20**
Yeah, it's probably good. I am just asking because I...

**Jivko Ivanov | 22:24**
If you spend five minutes on the page and somebody else takes an appointment even if you just click the soonest available button to search, it will...

**Wesley Donaldson | 22:28**
Third. That's fair.

**Yoelvis | 22:33**
To be honest, for me, when we rebuild the system for the appointment system, I would try to make it with web sockets so you don't need to do anything like that. You will see in real time what's going on with the appointments, but for now, we have this very slow API.
Okay, this is broken, so we can't keep it.

**Wesley Donaldson | 22:58**
Okay, so we'll. We'll not use that one. Get rid of that.

**Yoelvis | 23:04**
Like that's what you mean, right? Is the user one? For me, it's not easy to discover. You need to click here to refresh. But yeah, you don't.

**Jivko Ivanov | 23:17**
Yeah. I'm saying it's not a bad behavior. You can refresh by refreshing the page, etc. I'm saying it's not necessarily a bad or useless behavior, that's what I'm saying. You can refresh multiple ways, you can just refresh the page is an option.

**Yoelvis | 23:31**
Alright, no, I agree. Yeah, and other than that, the map here is where the height is shorter.

**Wesley Donaldson | 23:41**
A height is a...

**Yoelvis | 23:44**
This one is like...

**Jivko Ivanov | 23:45**
Yeah, but I like the bigger ones better from my side that I can see more. I actually think the map is even too small even on the big ones.

**Wesley Donaldson | 23:56**
Yeah, but the design is intentional around the size of the map because they're struggling to maintain.

**Yoelvis | 24:04**
Yeah, the idea is this map is for mobile view, and this map should be small because it's intended for the user to click it, not to show you anything important here.

**Wesley Donaldson | 24:05**
What?

**Yoelvis | 24:19**
Rather than just an overview of what's going on by the day, the user would have to click it, and here they would see everything.

**Jivko Ivanov | 24:30**
We can make it smaller. That's not a problem from the UI perspective. I think a little bigger is better. Especially nowadays, users have big screens on their phones, so... But that's perfectly fine, we can make it bigger.

**Wesley Donaldson | 24:44**
This feels like a call for Beth, not for us. The design is the call in my mind. So if we feel strongly about the height being higher, we should have the product make the determination.
Hold on, let me just dig a screen grab of that real quick.

**Yoelvis | 25:00**
But one second, let me remove thism.

**Wesley Donaldson | 25:00**
Well.

**Yoelvis | 25:06**
I can I can place to here map.

**Wesley Donaldson | 25:08**
Got it. Yeah, you paste it. They'll message her right now.

**Yoelvis | 25:12**
Hey. Alright, and where else? Okay, let me see. This is important because let me double-check the phone size. 16 pixels.

**Wesley Donaldson | 25:22**
Need a call.

**Yoelvis | 25:27**
This one is because I see mismatching phone sizes everywhere, and those are extremely simple to fix. This is 16 pixels.
So it's okay, 12 pixels.

**Wesley Donaldson | 25:45**
Wow, what is that? 20 pixels? It looks like 20 pixels higher.

**Yoelvis | 25:50**
Well, piza. So this is good? Yeah, this is all good here. Probably this one is.
1616. Okay, we are good here. We did some improvement here. So something I noted here is like when you hit the C more we used to I used to see like a C less, I believe.
Not here, but in the appointments.
See more. Okay, here is a show, and here is a C. Is that what we had in the in this one? What show? Okay, it says show, and here it says C.

**Wesley Donaldson | 26:56**
Show. See, I see it. Yeah, I feel like we would not have made that up. That probably changed on the map.

**Yoelvis | 27:11**
This text here is 12 pixels, and the one here is... Let me just pin this. We are doing great here.
So show more time after you click it. What's going to happen? Appointment shows fewer times you see this many screenshots. This as well.

**Wesley Donaldson | 27:49**
What does it do? Click on it right now on the left. What does it do? Click on more.

**Jivko Ivanov | 27:53**
Nothing.

**Wesley Donaldson | 27:54**
Nothing.

**Jivko Ivanov | 28:01**
It should be "headshots" like what's better for me. Why? I know it's in the design so yeah, if we need to add it, just wondering what's better.

**Yoelvis | 28:13**
This happened in the other steps in the next steps. I will show you.

**Jivko Ivanov | 28:21**
No, that's fine. Just wondering if it's better to get headshot times. That's okay, yeah, that's okay. I'm just like, "No."

**Yoelvis | 28:30**
No, I'm just saying it's not... I'm not complaining about what you say. Just saying that this is happening in the other steps. We are expected to see this show less according to the design, that's what I mean. We can have a discussion if this is better or not.
But this happened in the other steps, as you can see here, we don't have the... Okay, this is not the design was different. The design was like when you click it, this is going to be here and it's going to say "Clone."
But I can show you later. Okay, let me get back to the step one. So here in the step one right why this is like blue the border because it's selected. Okay, let me select something. Okay, when you select something, it's supposed to be blue, the section border. Okay.
Everything I say we will spend more time talking about this than fixing this. It's very easy, but I just prefer to go through everything because otherwise we will say it's spent you always been.

**Jivko Ivanov | 30:04**
I personally think you should just sit down and fix those right now. What are we doing? You are uncovering. We have three people here taking screenshots, taking ops, creating tickets, and we just sit down and fix this.
None of those are hard. I mean, you'll ask the cloud or something to do it for you. That's what I would do if I took it. It didn't just validate, it's fixed.

**Yoelvis | 30:28**
Okay? It's good to have more eyes so you can help me as well to find stuff. Of course.

**Jivko Ivanov | 30:33**
Of course, just think more efficiently.

**Wesley Donaldson | 30:37**
And rather this be QAs job.

**Yoelvis | 30:38**
Yeah. I agree but I want...

**Wesley Donaldson | 30:40**
Honestly, keep going.

**Yoelvis | 30:47**
This 220 fix is not needed.

**Wesley Donaldson | 31:03**
So of the ones I've shared with Beth, she's basically like, "These are all low priorities so far."

**Yoelvis | 31:09**
Two. Okay, here. I don't see this copy here. This search using current location was added by me, but it's not in design. This cancel button is okay, the search is okay. So my question is, "We add this copy."

**Jivko Ivanov | 31:40**
When you remove the empty field, okay, it's above the field. Okay, yeah, it's not there.

**Yoelvis | 31:49**
Or should we remove this usage?

**Jivko Ivanov | 31:53**
I personally think that be like placeholder inside the field enter zip code or city like inside the field placeholder if the field is empty.

**Wesley Donaldson | 32:04**
Yeah. The search by your location uses your brow is like permission to use your browser location, so that's more valuable than the label.

**Yoelvis | 32:11**
Yeah. Alright, so this is the bright holder as.

**Jivko Ivanov | 32:19**
Yeah it's address city state zippo you can we can change it to enter zip code or city.

**Yoelvis | 32:26**
Yeah I don't love the this line here is in necessary. I can't remove it as well.

**Wesley Donaldson | 32:34**
I wouldn't do that. It feels like that's an intentional header from Creative.
Like that's that.

**Yoelvis | 32:39**
No, this is okay. I mean the line between the...

**Wesley Donaldson | 32:42**
I see. Yeah, I agree, but same thing. How much Creative design do we want to take on?

**Jivko Ivanov | 32:50**
Yeah that's more of a yeah def question. I would be something like that.

**Yoelvis | 32:56**
I don't think they would complain. It's like this is a super small detail, but we can't always check. Okay, because here you don't see that line anywhere or anything like that. It's just to be...
So the one thing I wanted to say about this that is more important, let me... So what's going to happen if we have something like this right now? It's doing nothing. But you mentioned you wanted to display an error. Broadly saying select a valid input on that.

**Wesley Donaldson | 33:39**
Yeah, that's been my preference. Like, I just it's such a low bar right now, honestly. Like ca. It's just using the old address.

**Jivko Ivanov | 33:53**
Yeah, it's better to say in valid address will please enter a valid address or select a valid address or something like that.

**Wesley Donaldson | 33:57**
Yeah, can you type it?

**Yoelvis | 34:00**
But something I noticed and I don't know why I found this issue in some areas, like Los Angeles County, for example. If I select this one, it's going to do nothing. I guess it's because this one is not returning a valid ST call, so we can't use it, but we are displaying it here.

**Wesley Donaldson | 34:25**
Yeah, we should figure it out.

**Yoelvis | 34:25**
If I search it, it will be nothing.

**Wesley Donaldson | 34:30**
So that's a natur.

**Yoelvis | 34:30**
I don't know if that's going to happen. Often if I select this one, for example, it's going to be going to search autom.

**Jivko Ivanov | 34:40**
More interesting up for investigation, I would say.

**Wesley Donaldson | 34:42**
Exactly. Hold on, can you let me screenshot that for you? Type in Los Angeles.

**Jivko Ivanov | 34:42**
Why is it doing nothing?

**Wesley Donaldson | 34:53**
Okay, got it. Some county action does not cause... No, my dreams.

**Yoelvis | 35:09**
Yeah, that's probably expected.

**Wesley Donaldson | 35:09**
Were you...?

**Yoelvis | 35:13**
It's expected for me because I am doing a validation. If I don't get a zip code out of a location, I am not considering that location because we need the zip code. That's the information we send to the back on, the zip code and the miles.
So maybe we just need to remove from this list the other locations.

**Wesley Donaldson | 35:36**
That come...

**Yoelvis | 35:37**
We know the codes, something like that. But you know, it's a small data pad. Is there?

**Wesley Donaldson | 35:44**
Zip codes? Got it.

**Yoelvis | 35:50**
Alright, you guys... Here is there? Where is the plan for the error in a different place?

**Wesley Donaldson | 36:01**
So, wait, it did show an error, and it's just in the wrong location.

**Yoelvis | 36:01**
So this is the... Yeah, we are showing the error, but not like when we are supposed to show it. It's in this form. We are showing it here after you search. So if I put whatever search, the error is here. This is what we can display just in the input. We can put this red, display the error here, and we call it today.

**Wesley Donaldson | 36:32**
Okay, got it.

**Yoelvis | 36:37**
What I want to do is. When iactor this, I want to refactor this into a proper form. For whatever reason, this is not a form.
And you know everything is simpler. We when we use forms in HTML even EAs it for an input.

**Wesley Donaldson | 36:55**
Do we think that's something that we can...? I don't think refactors are really the right call right now unless you have bandwidth that I'm not aware of. LSI feels like team members have a good amount on their plate. We should identify what is urgent to fix.

**Yoelvis | 37:10**
No, I can't do that as part of the improvement. Okay, show more here. Show more. It says three remaining, but every time I click it, I see more and more, so I don't feel like that. I feel like that three remaining are coded as you click here.

**Wesley Donaldson | 37:30**
Okay. This is on the appointment page.

**Yoelvis | 37:33**
This is playing like a lot of West ridings, but like six more, not three, so that's that is misleading. Basically.

**Wesley Donaldson | 37:45**
Misleading and could be hard-coded rather than detecting.

**Yoelvis | 37:52**
I would say that it was hard-coded when I did the Figma to who called quick implementation maybe that was hard-coded still today and now I don't see the "see more." What happened here?
Because it's a different location, I guess. Okay, show more. Okay, hard-coded needs to be fixed there. Let me see where... Okay, this is all for the first step you have really noticed this blue thing here.
Okay. This is important for me. Is this in the ticket?

**Wesley Donaldson | 38:36**
Yes. We have that. Yeah, that's in the other set of tickets that we made last time we went through last Thursday.
I think we went through it.

**Yoelvis | 38:46**
All right, now this D is huge. It is not necessarily what we want. So for the packages. Okay, this included here is basically not the same style for sure. This year, the date is underneath the location.
I think we have already noticed that this icon is much bigger than this one.

**Wesley Donaldson | 39:15**
Hold on to that.

**Yoelvis | 39:16**
Those are simple changes.

**Wesley Donaldson | 39:18**
Let me go. That one is unp packages. We have the date. I don't think we... We have the included, but I don't think we have the location of the information being underneath to the right.

**Yoelvis | 39:37**
I can... We can fix it as well. Here as part of this and this included, this is centered, and this is aligned to the top. When you hit a PR assessment, that's what I say. You will see something like this. Hide all assessments under the assessments right now.
It's not doing that. It's still displaying "View all".

**Wesley Donaldson | 40:02**
Missing "Hide all assessments" and then go back up a little, please. Formatting on the date.

**Yoelvis | 40:19**
This number is missing here, the price.

**Wesley Donaldson | 40:24**
Price is missing. I would say that one's a better approach. Why throw the price on one line?

**Yoelvis | 40:44**
The price is in the next line here. Everything, yeah, it's probably good here, right? I thought it was missing. No, the price is here at the right, and here is at the bottom. Okay.

**Wesley Donaldson | 40:58**
Nowhere else do we have it on the bottom like that.

**Yoelvis | 41:04**
Yeah, I like it here for...

**Wesley Donaldson | 41:10**
Stand up s small.

**Yoelvis | 41:10**
So let me see the font size 16 and this 01:16 14 14.
14 14. Alright, this is 12. Okay, very good. Select an...
Ask the QA. I forgot his name to create a ticket so we can...

**Wesley Donaldson | 42:00**
7.

**Yoelvis | 42:03**
When you hit the anywhere here, it should select the element.

**Wesley Donaldson | 42:10**
So this is... Hold on, let me just... Let me get a few.

**Yoelvis | 42:10**
No, you it.

**Wesley Donaldson | 42:17**
If you are missing select state on package on diagnostics, DI user clicks anywhere.
Was say yellow.

**Yoelvis | 42:45**
Do you know what I mean? It's like the user should be able to select this by hitting anywhere in this car, but here and now they need to hit this radio button that is small and hard to hit.

**Wesley Donaldson | 43:03**
Not just the radio open, correct?

**Yoelvis | 43:12**
This button is definitely looking different than the design and it's smaller. It's a checkbox. Here is the normal radio.

**Wesley Donaldson | 43:23**
Is that in conflict with the one directly to the right of that in the design? See those checkboxes?

**Yoelvis | 43:32**
What do you mean?

**Wesley Donaldson | 43:33**
So in the like, forget the site for a second look in just the on the right of your screen. See how the radio's on the right hand side the check the Bullet the Bulleted List. Like from a design perspective, I'd rather have the blue check box which corresponds back to the green when it's actually checked and confirmed. Nitpicking.
But like, from a uix perspective.

**Yoelvis | 43:56**
Yeah, that could work. I would. I'm not sure, but you have a point there.

**Wesley Donaldson | 44:07**
I mean, we can just... I'll select it, but push back a little. Like, "Hey, can we just use the consistent...?"

**Yoelvis | 44:15**
I kind of like this more. It's more like the standard "ready" button, but it's stronger for the user to see it is easier. These are like part of the text here, the copy.
But we are not having adding... We are not clicking or not doing anything like that.

**Wesley Donaldson | 44:32**
Yep. Please go.

**Yoelvis | 44:36**
It's just visual stuff, and this is like actionable. You can click it.

**Wesley Donaldson | 44:43**
Scroll right there. Got it. Radio buttons on packaging should be blue infill.

**Yoelvis | 44:57**
This is 14 pixels. I'm sure this is not 14 pixels. 40 pixels, 24. Okay, this number here is 24 pixels, but in our implementation, it is 04:40 instead of 24.

**Wesley Donaldson | 45:18**
Correct. Can you just yeah highlight that again please just highlight one more time highlight thank you. Got it. Font size inconsistent. Should be 24px, not 40 PX.

**Yoelvis | 45:42**
Do we need this add 2 base copy? Actually, I don't think this add past tense if I haven't selected this or this is what's gonna happen.
It's gonna be 99 added to base. Okay, do we need the added to ways? Maybe this is more business-like for beta.

**Wesley Donaldson | 46:11**
That is again beta's call, but I'll add it. Missing text for added to base as part of the price for a diagnostic.

**Yoelvis | 46:33**
Yeah, I'm going to work on this as well. Do you think I should take this? I can work on this today or... What's the plan?

**Wesley Donaldson | 46:44**
My preference would be if you could just... As Jico said, these are probably faster if you just sit down for an hour and knock them off.
It's going to take you more time less time to fix them than for us to create the tickets, send the tickets over, run the tickets through the process, get PRs back on them.

**Yoelvis | 46:59**
Yeah, no, I just...

**Wesley Donaldson | 47:01**
It's way more...

**Yoelvis | 47:03**
I agree. I but I value that. We are adding the screenshot here, so I can't take those as reference or we don't forget yeah, but from.

**Wesley Donaldson | 47:11**
I mean, we could probably give Jico... Jico, you could probably head on a focus back on some of the coupon stuff, and you and I can continue.

**Jivko Ivanov | 47:23**
Thank you, Tim. Again, tomorrow will be jury duty, so probably won't be here.

**Wesley Donaldson | 47:30**
So just co please, before you're before you head out tonight or tomorrow morning, just give me a status on the coupon stuff.

**Jivko Ivanov | 47:37**
Yep, will do. And I guess you want on the SCA as well?

**Wesley Donaldson | 47:42**
Yes. I mean, that's. We're going to talk in twelve minutes.
But like for that I hope to get to clarity on it should be pretty much done.

**Jivko Ivanov | 47:54**
Yes, to some extent. So... Depends what you mean then if you mean for tested to deploy on production, no, you're not there.

**Wesley Donaldson | 48:02**
Yeah, we're not... It's not deployed to production or working tested in production. But the stack... I think my curiosity is that you should be able to have the stack in the blue-green. If you follow the existing pattern, we should have a stack in blue and green.

**Jivko Ivanov | 48:16**
We already have that. It's not... We already have that, it's just not... The stack reaches to death only not to prod and if you see the conversation there asking for these domains, etc., got confirmation for the SL that it's there. Francis will create the domains and I'm right now extending the stack prod, including what I always suggested, to use the other CI pipelines that look... I look at CI pipelines.

**Wesley Donaldson | 48:46**
Nice. Perfect. Okay.

**Jivko Ivanov | 48:49**
Sounds good. Thank you. Talk to you guys later.

**Yoelvis | 48:52**
You add membership. If I hit this wooden... I am sure the thing is 1416 I have.

**Wesley Donaldson | 49:11**
They look about right.
Although the bigger one you're missing there. You see where it says added hyphen saving thirty? That's not there.

**Yoelvis | 49:28**
Yeah. This is a slightly... The implementation is 16 and it should be 14 pixels for remove membership. I guess the button should be a bit off. 14 and here is... 16 is actually bigger in the design. Okay.

**Wesley Donaldson | 49:51**
So what's the... So the added, I think the saving thirty. We got rid of that because we have only one year in the PayPal version, but now that we're getting that back, actually, that should be part of the other ticket. There's a ticket for actually adding membership discounts, so I'll ignore that, but let's... What's the fix? Here's just the...
It's too big inside of the design, so the UI needs to be updated. The size of the added needs to be updated to match the design.

**Yoelvis | 50:28**
Let me put this. This is for me, for my node. So I don't forget I bear she...
Okay, this is a book. What happens right-click here? It's removing... Is this a right-click copy and membership read today?
What is this button? Is this collapsed? There's a button here. Do we need this button?

**Wesley Donaldson | 51:30**
Just give me one second. Multitasking.

**Yoelvis | 51:37**
Eye assessment. Why do we have this? I don't know. Sometimes, trying to follow the design is not the best day because the signs are missing some details in some cases.

**Wesley Donaldson | 51:51**
Uhmmm.

**Yoelvis | 51:53**
Do you think we need to hide it here? Do you see a value in that?

**Wesley Donaldson | 51:58**
What are we hiding? Just words renewed, 19 something, or the other.

**Yoelvis | 52:02**
It's going to look like this. It's just hidden in the list of stuff that you can get from here.

**Wesley Donaldson | 52:13**
Same thing. It's my perspective. It's not a lot of value to it. It's not like we're really taking up that much space, but that's what her name's call. I got it. Hide function.

**Yoelvis | 52:27**
So what do you think it should be? Add or no?

**Wesley Donaldson | 52:30**
I think we should not add it, but we should let Beth know we're not adding it or proposing not adding it. Missing. The...

**Yoelvis | 52:36**
Hey.

**Wesley Donaldson | 52:37**
Hi, all assessments. CTA.
I shall else make this edit.

**Yoelvis | 53:09**
Yeah, I asked this. The style for this one is different. So this is all for this page, I guess.
What happens if I click this button? Okay, it is opening this. Okay, what happens if I hit "Modify"? It's going to take me to the appointment.
That's perfect. This one is still selected. In general, my feeling about this implementation is that it's good for now, but it's not what I would expect. I would expect something more like using... As I mentioned, Lisock and something like that because there are a lot of issues here.
If you go to the next step, for example, this is probably going to fail. Now that I see it's not failing, the issue I see is that the appointment could be taken by this time because you spent more than 15 minutes.
But you still see it here because we are just restoring the state. We are not doing triggering a new search. So maybe when we get to the step one, we should always trigger a search.

**Wesley Donaldson | 54:46**
Five.

**Yoelvis | 54:49**
Something like that.

**Wesley Donaldson | 54:51**
I mean, we're covered because of the fifteen-minute check that you have inside of the final step that task that you completed this week. Because that would check to make sure that if it takes you a long time to get a check out, that fifteen-minute check would have seen it. Which is not a perfect catch for this.
But it should catch this.

**Yoelvis | 55:16**
Yeah. Now, what I mean is that maybe those times that you see here are stale at this time, and you are trying to select something, but you would see something that is not actually available.
So let me just try that. What happened? If I go here in a separate tab and I select this time the 11:12:5...
Okay, this is broken. This is the main bug that we have there. Okay, here if I isolate but I cannot select 11:25 charge of the Holy Spirit in the... What is the share of the Holy Spirit? Probably because I had 50 miles.
Okay, here, if I select 11:25 continue the packages I want reserved in that spot, right? But now that could happen because there are a lot of users selecting the first spot, probably in that location.
So now if I go here to the next step and I go back to modify, I still see that one even though that one is not available. But that's because we are... I am not refreshing the list. I would see a lot of stale data here.
That's the implementation that Jeremy did, but I think we could probably improve it at some point. But what happened? If I select this one now, I should get an... Right, because that one was selected by someone else. Let me see. I was able to select it.
So that's a problem.

**Wesley Donaldson | 57:13**
I remember this conversation. I remember this. So I flagged a similar concern back when we first did this, and the direction was... It's a known issue where it's possible for someone to book the same slot.
So they have steps to handle that on the back end as well as steps to handle that at the actual location itself. So it's not the end of the world if it's more than one person reserves an appointment time. That was the direction I was given.

**Yoelvis | 57:40**
Yeah, no, I know it. What I say is if we can make it better, it would be better just to avoid the overhead in the business users they will have to do.

**Wesley Donaldson | 57:48**
So let's simplify. It is this... Sorry, it is a simplification. Here is when you click on "Appointment" to the header or when you click on "Modify", it should just rebuild. It should rebuild the state and pull from the updated list of available locations.

**Yoelvis | 58:06**
Yeah, I think that will reduce that issue a lot. If you hit "Modify", the only problem is when you hit "Modify", we are just... Let me tell you, if I refresh this page, I am not preserving my spot.
That's another potential issue, probably, but no mind here. Maybe we can just pull everything but then combine that with what we had selected. We could have something like...

**Wesley Donaldson | 58:44**
It feels like the first simple fix here is just to rehydrate the state. If you navigate back to this page, we know you're... But then we don't have to select the partner if the partner you...
The time you selected is still available, we'd have to select that. So the flow would be if you navigate back, rehydrate the state, is the time still available? Yes, then pre-selected if it's not still available, don't select one. Sure, all right, I gotta jump. You got that one right?

**Yoelvis | 59:13**
But. Okay. No.

**Wesley Donaldson | 59:18**
See that?
Afternoon, gentlemen.

**jeremy.campeau@llsa.com | 59:30**
Good afternoon.

**Antônio Falcão Jr | 59:32**
Hello.

**Wesley Donaldson | 59:54**
Well, Antonio, did you make this change?

**Antônio Falcão Jr | 59:58**
Was sa he was about to talk with you.

**Wesley Donaldson | 01:00:01**
So... Okay.

**Antônio Falcão Jr | 01:00:01**
Probably he didn't have the opportunity, so we have some news. This is my new task but he will sync with you about this.

**Wesley Donaldson | 01:00:11**
So he actually is invited to this meeting, so maybe we could touch on that.

**Antônio Falcão Jr | 01:00:16**
Okay.

**Wesley Donaldson | 01:00:17**
30 minutes.
How is this?
So that's going to be your new task, I guess. Antonio. Then I think my cue, my curiosity is... We could do this offline, but since there's no one else here just yet, the BI specific needs those projections that you've already created. I suspect much of those projections maybe what the BI team needs. Can you just give me a bolded list of not a bolded list? Can you give me a markdown that just says, "Here is what the projection is and here are the data fields that are available inside of it?"

**Antônio Falcão Jr | 01:01:17**
Absolutely. Nom do there right now.

**Wesley Donaldson | 01:01:19**
Yeah, I'm thinking that could be a good start to addressing what their specific needs are. Honestly, if you want to just maybe start here, I'll send you this. Take a look at this list and see if we've already covered off on these, okay?
All right, let's see, what else do we got?
All right, let's get started. Actually, I really need Jeff and Francis on this. Let me ping them.
Jeff, Francis, gentlemen.
Antonio, did you have a chance to connect with Francis or Jeffco around the environments?

**Antônio Falcão Jr | 01:02:45**
We talked. Yeah, Jeffco is working on the webhook, LLaMA merging, Circa DK SLA stack merging to the main one, and I'm going to do the same to the ACL side.

**Wesley Donaldson | 01:03:00**
Okay, so that's these two, perfect. And then for these over here, I guess, sorry, this one right here. Lance, do you. What environment are you creating this in?
Like, is it. What's like what stack are you creating this in? Is like the OR original stack or is it the new stack that Jico had originally created?

**lance.fallon@llsa.com | 01:03:27**
The connector Lambda is under the current connectors, but that sounds like it's being redone.

**Wesley Donaldson | 01:03:30**
Okay, I am not familiar with what this represents and what impacts those hard to these. So for now, I'm staying the course.

**lance.fallon@llsa.com | 01:03:42**
I...

**Wesley Donaldson | 01:03:43**
Unless you know something. I.

**Antônio Falcão Jr | 01:03:45**
I can give you a quick update. I was expecting Sam to join us but John intends to implement Emmett in the ACL LLaMA part and for that we can rely on projectors and reactors. Mostly on reactors for those C-star integrations because the MT will keep one single process for this entire flow. Which means that if anything fails in the middle, we're going to have a dead-end queue to back us up. By relying on Lambdas in the middle, the Lambda can fail.
There is no resilience on this matter and no deliver guarantees. So once it is a very sensible integration via intent, we will propagate because it will cause some significant side effects on the car side, we do need to make it reliably.
So, Sam's idea is to start working as soon as possible on these refactored from the ACL LLaMA to use MT, not our current CQRS standards, LLaMA and so on. So no current connectors. We're going to use in-process reactors for that.

**Wesley Donaldson | 01:05:16**
Okay.

**Antônio Falcão Jr | 01:05:16**
Do you understand my point?

**Wesley Donaldson | 01:05:17**
I guess my question would be that's only for shop with us's only for the recurring implementation.

**Antônio Falcão Jr | 01:05:17**
Yeah, only.

**Wesley Donaldson | 01:05:22**
Like we're not.

**Antônio Falcão Jr | 01:05:23**
Yeah.

**Wesley Donaldson | 01:05:23**
Okay. All right. So then that the only real impacts here then are going to be the work that you did basically the existing model, the existing Reed models that you created, and the land that we're working on that pushes to event grid.
Then this LLaMA Lambda that we need to create, I guess this one.

**Antônio Falcão Jr | 01:05:43**
That's correct. The C-star connector will become a C-star Reactor, actually. So I need to provide the base design so Lens can extend and use it to implement his connector. That will push the D to a integrade.

**Wesley Donaldson | 01:06:09**
Okay, so I guess my question then would be what amount of this work is throwaway? It sounds like all of it is throwaway then. So then... Lance, you should stand down until we get this from Antonio.

**Antônio Falcão Jr | 01:06:19**
That's correct. Yeah. If I'm not mistaken, Lance was about to start working or learning at least on the 31. The limit on the top that will become a reactor to the membership renewal if... I'm asking Lance, can you? I don't want to talk about your behavior.

**lance.fallon@llsa.com | 01:06:40**
Yeah, I mean, I don't know the direction that's been agreed upon, but Sam suggested I start looking at the reactor stuff in Emmett. Then there was apparently a subscription MMA ticket, which is that red guy up at the top.

**Wesley Donaldson | 01:07:00**
Yeah, so I was going to send this over to you, Lance. Antonio, my original plan was for you to tackle it, but because you're working on the projections for the BI team and now you're working on the single process for EMT, it doesn't...

**Antônio Falcão Jr | 01:07:11**
Yes.

**Wesley Donaldson | 01:07:15**
It has to be...
So, Lance, you're going to take this? It's pretty straightforward. I can add you to the conversation. I can send you what I have so far. Nothing major, but this is basically like a contract that exists with ceased with the event grid, and we just need to hydrate that contract based off the membership renewals. Stream...
But I can... I'll get your ticket for it, and I'll... I'll add you into a conversation that we're having with David from the Endo team right now. That would free you up, Antonio, to focus on this pattern as well as you're helping with this as well.
But then... Lance, I guess... Mike, I guess let me rephrase that. Antonio, would you then handle this or is the expectation you're going to deal with the critical setting up, the process, and the approach, and then once you're done with that, then... Lance, get this back.

**Antônio Falcão Jr | 01:08:11**
Lance will get us back as soon as I can provide the design base for it. So basically, I will set up Emmett and give him the reactor implementation so he can set up a reactor for those two to PO limits. We will not be limited anymore, but yeah, they will be reactors actually, no, they are in the same ET process. They are in process dispatch reactors.

**Wesley Donaldson | 01:08:32**
Got you. Or where are those reactors executed? They're not inside of a LLaMA.

**Antônio Falcão Jr | 01:08:47**
That is Sam's idea. So we can now count on that ri que if any problem occurs in with those reactors.

**Wesley Donaldson | 01:08:59**
Okay, and then the DLI... I think the approach is fine.

**Speaker 7 | 01:09:00**
Yeah, just on that note, sorry. On that note, I think the DLI for the land does... Like any external system we have, the DLI actually needs to be in between them. So as we send things from the lander to event grid, my idea there is that we would have a DLI right in the middle there, an SQ right in the middle, so that way we know it's out of our lander and it's on the way to them. We've done our... Any subsequent failures belong in the DLI, is that a thing? Actually, let me figure that out one more time.
Sorry, let me just say that one more time. We've got event grid. Is that itself a queue?

**francis.pena@llsa.com | 01:09:40**
It's like a bridge, so it has that letter queue.

**Speaker 7 | 01:09:47**
Okay, so once we send it over to... If we just send it over from a reaction straight in, do we need to maintain some queuing on our side? Or can we just assume it's almost a fire and forget?

**francis.pena@llsa.com | 01:09:57**
Yeah, fire. Fire and forget as soon as it's acknowledged by the event, great, you can forget about it.

**Speaker 7 | 01:10:02**
And if it's not acknowledged.

**francis.pena@llsa.com | 01:10:04**
Then you'll need to put it on the letter queue or retry from the... Side.

**Antônio Falcão Jr | 01:10:08**
Yes.

**Speaker 7 | 01:10:10**
Yeah, so then yeah, like that's we might want to build a subsystem just around that then. So let me schedule the SL correction diagram real quick and t to it right now. So I think. I think the way this would work here. Let's move everything over a little bit. That move this lander outside. Just make this on the inside here like that.
So then this lander would have to sit in the. Would have to have a escusta.
Makes sense, and that would have its own DAL cue. And these are set up, right? Yeah, exactly. So the reactor is in here.

**lance.fallon@llsa.com | 01:11:06**
The reactor send to the queue and then the queue exactly.

**Speaker 7 | 01:11:10**
Exactly.

**lance.fallon@llsa.com | 01:11:10**
It's picked up by the lander that sends to an event queue.

**Speaker 7 | 01:11:13**
Correct? Because now it's out of our... Basically what we're saying there at this point is we've handled it, right? We know we're confident that this has been handled and it's in a queue, and if any subsequent problems happen, we go to that queue to fix them.
But at least this guy has done his job. Now we don't have to have retries. Because what happens here, if it drops, where does it go? See what I'm saying?

**lance.fallon@llsa.com | 01:11:47**
Well, if it failed to get to the queue inside of... We'll not wind up on the dead letter queue. Is that what we're saying?

**Speaker 7 | 01:11:59**
Exactly. If it fails in here, like, it's like the hydration of an of a event comes in. So let's say this is an order placed event coming in. Let's just take it through it comes in and so Guy says, "Yep, I'm doing the ad, but I've done it and I've recorded the event in current." Analis has been recorded in current. Next, it comes over here to one of the reactors.
I mean, one of them is a reasonable updatery. Another reactor kicks in and says, "Okay, I'm now going to send this over." Now, if this fails, we don't want to fail the whole thing. This isn't that we got a dead letter queue for an event that wasn't able to be processed at all. This is more of an event further downstream in our reactors that before it went to the next system.
So that event needs to come here and go through that dead letter queue to... Right. That tells us just exactly which subsystem needs attention rather than this is any part of this system. The ex...
But these are pretty easy for us to set up, right? So go ahead.

**Antônio Falcão Jr | 01:13:01**
Yeah, one more time, just to make sure that I got it right. So we're going to try to react on the MT level. If we fail somehow in each reactor per reactor, we're going to push that message to a specific dead letter.

**Speaker 7 | 01:13:20**
It depends on what the reactor is doing, right? If the reactor is calling an external system, this is purely to handle external system failures. So in this case, this reactor is... Yes, permanent, but it's saying this SQS is for us to talk to VT grid and we're managing this in the drive system, making sure that we're sending everything out to the...
So I guess this is uncommon.

**lance.fallon@llsa.com | 01:13:44**
But if we failed to even send to the SQS, that would wind up on the dead letter queue to the left, though.

**Speaker 7 | 01:13:54**
Yeah, it's extremely uncommon. But yeah, in that case, I guess you have to. I mean, at that point we can just fail loud in the logs and get some alerts. I think probably logs are better at that point.

**lance.fallon@llsa.com | 01:14:04**
So don't throw that. Yeah.

**Speaker 7 | 01:14:11**
I don't think this I would say sq S within the within AWS operating it's extreme like the percentage is just so low it's not worth were top.

**Antônio Falcão Jr | 01:14:25**
Okay, one last question. How do we intend to consume this letter later? Because once we handle the problem, we need to reconsume those messages, right? Then we're going to reimplement how to reconsume them. Just a matter of... Okay, just letter.

**Speaker 7 | 01:14:45**
Yeah, no problem, that letter is going to be... He's in order, right? Maybe we have a pilot, we have them start to pile up like that. There's something going on here. But the only thing that could be going on is this. The only problem is that this land is what ultimately puts them in...

**Antônio Falcão Jr | 01:14:59**
Okay, I see what you mean.

**Speaker 7 | 01:15:02**
So we've isolated the problem purely to a connectivity like the systems down. Therefore, we're holding these in place for you, but then send them through once they're done. Therefore, we're guaranteed operational from our side, or at least we've mitigated it to the max.

**Antônio Falcão Jr | 01:15:15**
Got it. Okay, I got it. Right.

**Speaker 7 | 01:15:19**
So and I don't want to be polluting this because if this dead letter cue becomes as more responsibility, it gets worse. Like this dead letter, sorry, this SQs here. Purely for your events coming in from...
And if for whatever reason we couldn't handle them right, then at least they're queued up on our side for us to handle. That's what this is doing. So that keeps it at just that. Yeah, so anytime we're talking to an external system, we should basically create a queue. Effectively, there's a QE stack is what this is. How's everybody? Keating Goddess.

**Wesley Donaldson | 01:16:17**
I think my only question would be just Antonio, like your... What's your... Just help us with the timing, I guess so we can pivot Lance to work on setting this to the queue as well as the Delaware queue, and this we think is something for Tuesday and Wednesday. My worry is just like Lambda, Lance has paused on the Lambda work until we get to a good place. Here is anything that we can give him to start working on block while we work.

**Speaker 7 | 01:16:46**
Yeah, one of the reasons why we don't want to build these SQs Lambda the DLQ set up over here like this. We're going to need this over and over anytime we have an external system, we're going to need this, right? We already need it in two places right now over here, so is that something you're comfortable with?

**lance.fallon@llsa.com | 01:17:10**
Yes, it appears you want it to be reusable. I guess.

**Speaker 7 | 01:17:15**
That's a stack, right? We like to have a call it whatever stack that basically does that. I've chatted with Claude about how to make it into a reusable CDK stack.

**lance.fallon@llsa.com | 01:17:27**
Is that a new stack?

**Speaker 7 | 01:17:29**
Yeah, it's a reusable CDK stack. SA. Ach. Claude. CIS to do.

**Wesley Donaldson | 01:17:43**
Okay, one thing that we had... We wanted to close the loop on today.

**Speaker 7 | 01:17:44**
Two?

**Wesley Donaldson | 01:17:48**
Francis, thank you for being able to join. Can you speak to just the progress you made around the tickets you had around the environment setting up the DNSs and such?

**francis.pena@llsa.com | 01:18:01**
Yeah, I'm waiting for the new... The API was to be deployed. There will be two, there's only one now there will be two. So once I have that, I can create the Cinnam entries, or I can ask the Infra team to have the Cinnam entries for those, because now we only have one.
So I think... CO will do that. If not, I can do it. But it will be creating the blue-green ones. So there's only one. Now we should have blue and green.

**Wesley Donaldson | 01:18:28**
So he should be working on that already. I think he has blue and green for Dev. He's supposed to be setting up blue and green for Prad as well.

**francis.pena@llsa.com | 01:18:36**
Let me check if it's there, then I can create that. At least the one for that I can do that. I saw earlier this morning was only one.

**Wesley Donaldson | 01:18:43**
8.

**Speaker 7 | 01:18:54**
Just fish a couple of things over here. I don't think we need two separate deadletic cues and so on. We just need one delet Q 11 sQS for all things going to event CRI right? We don't need to separate these out. We got with these closer.
So integrations are always reactors, and in this case it's over here. I like to unless somebody can convince me otherwise. Do we need to have do we need to have a separate.

**francis.pena@llsa.com | 01:19:29**
If it's going the same place right on Prem... Yeah, you should want to be enough as long as the receiving end, which is the econ... Maybe I can handle that. Both types of events.

**Speaker 7 | 01:19:44**
But a queue that takes any... It's taking different shapes of commands. One for you know that's Destined here, one that's Destined here, but it's all going to eventuate through a single lander. I think we can share the queue here.
It's no problem.

**francis.pena@llsa.com | 01:19:57**
That's fine.

**Wesley Donaldson | 01:19:58**
Is it the same?

**Speaker 7 | 01:19:58**
Yeah, but yeah.

**Wesley Donaldson | 01:19:58**
Lambda.

**francis.pena@llsa.com | 01:20:03**
But on the other side, is it going to the same place like the same receiving and can handle both types of events?

**Speaker 7 | 01:20:12**
But what I'm saying is we have a lambda that needs to send stuff to event grid if it receives. This LLaMA can be intelligent. Say, if I'm receiving a c star membership MMA thing, then I need to, you know, send that. The job that it receives in the queue is to send that here.
And this one says the job for this one is to send it that so wherever those are doesn't matter. These this just job you know event good job processor as well this sometimess.

**francis.pena@llsa.com | 01:20:39**
No, I don't know if that makes sense, but I mean the receiving end, let's say the e-com API, which is what it is getting the events from your grid. Is it able to handle both types of events that it's going to be getting from Evang Lens just going to...?

**jeremy.campeau@llsa.com | 01:20:55**
Sorry, the PayPal will have the event type, so we can write something to look at the event.

**Wesley Donaldson | 01:20:55**
Sorry ho.

**jeremy.campeau@llsa.com | 01:21:01**
Okay, react based on... Is that answering your question, Francis? Yeah, that answers.

**Yoelvis | 01:21:06**
Yeah, okay, cool.

**Antônio Falcão Jr | 01:21:07**
Thanks.

**Speaker 7 | 01:21:10**
Okay, so then I guess we don't need that line either. It's all going to the e-com API if I just understood you correctly, Gerry.

**jeremy.campeau@llsa.com | 01:21:16**
Yeah. We can do that. Then we'll just have to add code for whatever... That the MMA thing is that you were talking about is cool.

**Speaker 7 | 01:21:28**
He's just become the actor over.

**Wesley Donaldson | 01:21:33**
That simplified things a bit. So Jeremy, you're working on the e-com API for these specific use cases around the member renewal.
That's what this original stream of top was for. So I guess we just need to connect with David and just understand what... I know what the event needs to look like. That gets pushed over into VT Grid.
But if you're expecting this to consume it and then push it into CSTAR, you need to be part of those conversations.

**jeremy.campeau@llsa.com | 01:22:08**
Yeah, whatever. If there are any meetings or anything, feel free to add me. I don't know what the... I know LLaMA is, but I don't know what exactly they're doing. But I do know we can just look at the event type that comes as a part of the event object into an event grid.
So we can work separately and in parallel and have them be completely separate. So we should be good either way, I think.

**Wesley Donaldson | 01:22:29**
Yeah, I think I would even simplify this more like this function, this... Now its only job is just to push that event on the grid. They already have their own process that's going to deal with handling that event. I don't think we need anything in here that's specific, sorry, go ahead.

**francis.pena@llsa.com | 01:22:48**
No, you said that about the event grid that the event is just relaying the events. It doesn't have any brain, it just takes the events and forwards them to EC.

**Wesley Donaldson | 01:23:04**
Agreed.

**francis.pena@llsa.com | 01:23:05**
Okay, so the logic has to be in a component, not in the Angular.

**Wesley Donaldson | 01:23:08**
Let's get you. Okay, let's like, let's take that offline. It's not specific to this. Like, we'll. We'll start that conversation with. With David.

**Speaker 7 | 01:23:25**
We've spoken about a lot here, but let's just go through one person by person. Is everybody clear on what is happening? Jeremy? Sounds like you're clear, but let's get a check... Thumbs up, thumbs down. Any open questions from you?

**jeremy.campeau@llsa.com | 01:23:34**
Yeah, so we're just adding the SQS to separate out concerns if things fail or whatever. Then those are all going to the event grid, and that includes some new event type for LLaMA, but that's separate from what I'm working on, and we're going to work through that later.

**Speaker 7 | 01:23:54**
Exactly. To add to what you just said, there it is separate concerns, but to make sure that the event single process is fast. It doesn't have to do durable, it doesn't have to think about failures.
It just says, "Okay, here is the incoming event, I'm going to reorder place, I'm going to react to it, I'm going to put it on a queue, my job is done, thank you very much." LLaMA dies.

**jeremy.campeau@llsa.com | 01:24:15**
That makes sense. Thanks.

**Speaker 7 | 01:24:18**
Antonio, is everything clear from your side?

**Antônio Falcão Jr | 01:24:21**
It is clear. Yeah. I'll set up a meeting and provide the reactors to LLaMA so he can set up those.

**Speaker 7 | 01:24:31**
All right. We're going to simplify everything and make everything come into this single process ultimately. Just keep that in mind for everybody. It will be our single process, which should make it a lot easier to reason about what's going on.
All right? So Antonio's going to help us do that. All right? Lanance, are you clear? I feel like we've messed you around the most. Are you clear?

**lance.fallon@llsa.com | 01:24:53**
The floor? Makes sense. It's not 100% clear on where the SQS and the DLK live, what stack we're creating them as a part of.

**Speaker 7 | 01:25:07**
So I think all we need is in addition to the current stack that we have, which produces all our infrastructure, we're going to need a new addition to that, which is going to be called the Event bridge. Event grid.
Like job processor, let's say, which basically receives as items get added to the SQS, it will process them and it will put them in the event grid. If anything fails, then the SQS will take care of that and put it in the DLK for us.
So it's just going to be an additional... I would just basically make it a new package in our monorepo whose name is Eventgrid job processor. Build all of that stack in there and whatever goes into that LLaMA in there, all of that goes there.
It's a new package and now it's ready for the reactor to integrate with. And the reactor integrates with it by way of just putting things in the SQS and relying on it. Evening with the... Does that make more sense?

**lance.fallon@llsa.com | 01:26:00**
Okay, so that when that's created, other stacks will need to know about this guy.

**Speaker 7 | 01:26:06**
Then say that again.

**lance.fallon@llsa.com | 01:26:10**
Other stacks we need to know about. Yeah, the resources that get created as part of this stack. So I'll agree. We emit things like the URL on or whatever.

**Speaker 7 | 01:26:25**
There should be a pattern already in there for knowing who is my target queue. If there isn't and you need any help, reach out to Rinor or Francis obviously first and the team members.
But if you do really get stuck, then Rinor can help you. But there should be some patterns in there that already do this. But you're correct. Then that way the emitted process needs to know about where to put what's my... It needs to have injected into it somehow the URL, so that it can know to put things into it.
Okay, we have precedent for this, right?

**Wesley Donaldson | 01:27:00**
So sorry, Lance.

**Speaker 7 | 01:27:05**
Like we have different parts of infrastructure, different stacks. Knowing about other stacks, I'm pretty sure yeah.

**francis.pena@llsa.com | 01:27:13**
There is information shared in the workflows, the end points of other things like if you have an SQS, another stacking takes the ARN to put things in there. Things like...

**Speaker 7 | 01:27:25**
So now that Francis is your end mor spa, you can start working on figuring out what to do there. Is that all okay from your perspective now, lad?

**lance.fallon@llsa.com | 01:27:40**
Yeah.

**Speaker 7 | 01:27:42**
So processcis all clear. Yeah. Alr. And then? Where's you were gon to say something?

**Wesley Donaldson | 01:27:49**
Yeah, Antonio. The conversation you've been having with your Elvi us around moving things out of one stack to the other, cleaning up the location of where this landa for the a CL lives, and where the LLaMA for the webhook lives. That seems germane to this conversation of "We're creating new entries instead of a stack. Do you want to just share where you've neitted out with that, please?"

**Antônio Falcão Jr | 01:28:13**
I haven't moved yet with the work. The webhook LLaMA is the one that Gemini is doing now, and that's one it's outside of this, the meeting adoption. We touch that piece. Yeah, we're going to have to... I'm going to say, "Set up the LLaMA to go over this part."
So, eventually I'm going to cut that part, but I'm going to do that already. Merging this to the main... Is that just like we agreed? Shatif... Does that make sense to you?

**Wesley Donaldson | 01:28:58**
You mentioned the main stack and Sam mentioned like the intention to create a separate stack relative to SQS and this new Dal.
Okay, my Te Dal Q my question to you and to the team is where do these live? Are they living in the same like two different stacks? Are we? Then we're referencing using a RNS that's fine, but just looking for clarity on what stacks exist.
And are we creating a new stack specifically just for this?

**Speaker 7 | 01:29:26**
So we have a hydra go ahead. Sorry you.

**Antônio Falcão Jr | 01:29:30**
I would say that it's more of a team decision. We can't keep recurring in a separated stack. So everything like webhook a CL, Lambda packages, and so on... Or bring it in to the same stack we have now.
So it's more of a team decision. What do you guys think?

**Speaker 7 | 01:29:48**
I think there's a starting point right there like, "When we say ET single process over here, this is going to be basically a..." You already have this hybrid rate a CL Lambda package, right? That's a package. I assume in the module repo.

**Antônio Falcão Jr | 01:29:59**
It is a package, yeah.

**Speaker 7 | 01:30:01**
Okay, so this basically gets renamed to something... Let's just talk about... And that is the EME single process because it's already wired up to consume SQS and do this business over here. So... It already runs the Emmett.
Expanding this from what it is right there as a box right now to being instead effectively taken over that full box, that's what's happening. We're growing this into this that's step one. Once that's done, then within the EME scope, we basically have reactors and projections rather than using connectors, we use reactors and projections. The reactors over here will update SQS by way of an ARN because this is its own little stack, right?
This is going to be its own little project, its own little package. Let's call that something here like this is going to be the package SLA event grid job versus or something like that. Okay, that's its own stack with its own grade and everything else this guy would have to have injected into it the ARN of this queue so that these two things here can submit jobs into that queue, right?
That's the structure everybody's tracking.

**Antônio Falcão Jr | 01:31:25**
Yeah, we are. I think Wesley is more concerned because yours is raising some concerns about repacking everything from recursively on the same one and rejoining these stacks. So I think Wesley is looking for a clear position here. Are we going to do that or not?
Because right now we have our main stack that deploys the most part of the applications from the monorepo, and then we have a separate stack that deploys the LLaMA and another one that deploys the webhook.
So we have three of them.

**Speaker 7 | 01:32:02**
All part of the same mono repo, right? They're all part of the same mono repo.

**Antônio Falcão Jr | 01:32:06**
They are they yeah.

**Speaker 7 | 01:32:08**
Right, so it doesn't I mean it doesn't matter the deployment boundary doesn't matter. Why do we care about where it runs as a stack or not? Look, is there an issue?

**Antônio Falcão Jr | 01:32:16**
No, I don't see any issue. I think the team was trying to understand if we intend to control when it's going to be available for production or not. Just to not give every PR a three-guarantee deployment. I don't see a problem with that. Just to make my direction clear.
I think that Wesley is more about looking for a clear position. This Wesley... Sorry, I don't want to talk in your behalf.

**Wesley Donaldson | 01:32:43**
Yes, spot on.

**Speaker 7 | 01:32:44**
But...

**Wesley Donaldson | 01:32:45**
I'm just looking for clarity and consistency and then be able to push back on all of us if there's a differing of opinions.

**Speaker 7 | 01:32:53**
I mean, I think the fewer things a stack has in it, the better in general, as a general rule. Because then each stack can be updated independently without affecting everything else. So modularization is always good rather than monolithic. A deployment boundary is independent of the monorepo.
So as long as all our code is in one place and we can wire things up in one place, the deployment boundary can be one stack or 50 stacks. That's a choice in terms of deployment boundary. I think the rubric I would use for a deployment boundary would be the more isolated the better.
So starting with that, then I would say this Emmett here in terms of what it needs to run if it needs to be its own stack with its own... If we're talking about what the deployment boundary is, we're already talking about all the way from API Gateway.
If I just put a boundary on it and remove that stack...

**lance.fallon@llsa.com | 01:33:46**
Well, we have a separate deployment for the recurring stuff now, don't we?

**Yoelvis | 01:33:51**
We do.

**lance.fallon@llsa.com | 01:33:52**
Yeah. So it's a separate stack and separate deployment for what?

**Speaker 7 | 01:33:55**
For API, gateway, web, and all of that, yeah, I'm where I have my boundary right now. This is a stack right now, is what you're saying?

**lance.fallon@llsa.com | 01:34:06**
I believe so. Okay, antr a cl stuff is not part of that stack though, right?

**Antônio Falcão Jr | 01:34:15**
Anthropic is not... Yeah, he's not part. Anthropic is not part yet, but I was about to join it, I suppose. I suppose it's going to join it.

**lance.fallon@llsa.com | 01:34:22**
Yeah. Okay, so it is going to be...

**Speaker 7 | 01:34:24**
I mean, it doesn't matter. What I'm saying is if this is a recurring, let's call it ingestion stack, right? That's what this is here. This is just basically taking care of making sure all the stuff comes in and then it comes into a queue.
If you want to make this a separate... If you want to keep this a separate stack over here like just the basic handles this here in terms of the emit deployment like we can do that too. It's not a problem. Or if you want to merge them again, not a problem. I don't think there's an issue here. What concerns the office has... Let me know if you want to go through those, we can bring them to the architecture session. Wesley but I don't see any consequence here, honestly, it's so movable, it's so malleable, it doesn't matter. That makes sense, in my opinion.

**Wesley Donaldson | 01:35:03**
I like it. So then just to keep the pattern going, we would have this. This will be here as already. It's so... It's a separate stack as well.

**Speaker 7 | 01:35:12**
Okay.

**lance.fallon@llsa.com | 01:35:14**
Yeah, and then it would just be included as the recurring deploy in...

**Speaker 7 | 01:35:22**
If you want to. I mean...

**lance.fallon@llsa.com | 01:35:25**
Unless we could deploy it separately if we wanted, I guess.

**Speaker 7 | 01:35:30**
If anything, I think this stack actually would be inclusive of that. I think that's how I would do it if you want to do more stacks and so on. But again, separate ones are fine. It really doesn't matter, honestly.
Just as long as the infrastructure gets deployed, it doesn't matter. I'm much less concerned about this Chef's Choice.

**Wesley Donaldson | 01:35:57**
Nice. So then, Lance, just to close this out effectively, this is taken on two roles, which will get you two streams of... The ticket that you already had obviously was still waiting on...
And Antonio to get us to get you what you need. Then you can at least start working on the MMA specific portion of this, which is kind of self-contained.

**Speaker 7 | 01:36:27**
For the record, just to go back on what we're saying, my vote is to keep this stack as small as possible. This will be a stack, there's a pay stack's AA stack. Just keep them like that. Keep them based on the job they're doing. The job that one's doing is event bridge like per package or should have its own stack.
If you have stacks that go across packages, it just makes it a bit harder to reason about. So the smaller the one, the more malleable. Got it? Yeah, makes sense.

**Wesley Donaldson | 01:36:55**
Can we just. Could we just close the decision and say. I got to clean this up? But.

**Speaker 7 | 01:37:05**
Where you see a package like this is presumably another package, right? A package is slash recur or some things like it's going to be something like this recurly ingestion or recurly web hooks or whatever.
So whatever the package name is, just my vote would be to create... This one here is packages. Let's just call this like, you know, or like business core logic or something like this. If that's if this is the brain of the whole system, then that's basically our core logic.
And this one over here is a Venture processor. That's great. Homestack if you do it like this, it's very clear and you go to look at the, Amazon or you look at GitHub or you look at anywhere, it's like it's very clear this is being deployed into its own stack.
And they will share information between one another.
Okay? So everybody know exactly what they're doing. Like when we shut this line, you know exactly what you're gonna go work on. If not, put your hand up, please.

**Antônio Falcão Jr | 01:38:06**
It's pretty clear.

**Yoelvis | 01:38:07**
To me.

**Speaker 7 | 01:38:08**
Guys, well, I'm here if you need anything, thank you so much.

**Wesley Donaldson | 01:38:11**
These guys.

**Speaker 7 | 01:38:13**
Let's do it.

**Antônio Falcão Jr | 01:38:15**
Bye. Bye. Guys.

**jeremy.campeau@llsa.com | 01:38:16**
Thanks. Have a good one.

