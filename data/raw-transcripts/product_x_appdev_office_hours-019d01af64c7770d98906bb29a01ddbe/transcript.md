# Product X AppDev Office Hours - Mar, 18

# Transcript
**Jennifer | 00:28**
Ray, did we want to start with Firman's? That to you?

**Speaker 3 | 00:37**
Sure, I'm here. Yep, it's going to be a short one. Similarly, yesterday, it's just a bug fix issue. So, the bug was this one. There is a missing queue on the waves wording, so it appears in the summary and then the digital page.
So the Q is missing. So I did the fix. I'll show you the front end.
The results and then in the summary page or there of fibrillation. That QVE is here and then the V details. If you look at the art real elation part, here, like mentioned, just GE waves and the summary or the detailed paragraph is here quickly waves. I can show it to you in admin or... Let me get my account.
So a soil summary Ariel relation waves here and then detailed report should be the same thing here. So Q waves and then the paragraph Q waves and that's it.

**Yoelvis | 02:44**
That's great. Let's push production and then let me know when it's live so that we can have the nurses to confirm.

**Speaker 3 | 02:50**
Okay, cool.

**Yoelvis | 02:52**
Thank you.

**Speaker 3 | 02:53**
Thank you.

**Wesley Donaldson | 03:12**
Mandalore has a few items. Jennifer, but I mean, we would need Beth to review them. We can hold or maybe just thought she said she was coming.

**Jennifer | 03:20**
Did she say she was coming or I thought she said that too?

**Wesley Donaldson | 03:25**
We can soldier on and maybe review, but we wouldn't... That would be interactive feedback, but we can present and then maybe you can consume the recording or we can just pivot it.
I think my preference would be pivoted till the next session. It's not... Not urgent.

**Jennifer | 03:46**
Yeah, do we want to just message her and see if she's available? Come on, do that very quickly.

**Wesley Donaldson | 03:55**
Got it.

**Jennifer | 04:06**
There she is.

**bethany.duffy@llsa.com | 04:07**
I'm sorry, I was chatting really quickly with customer support. Is there anything other than the UI stuff that we need to go over today?

**Wesley Donaldson | 04:23**
No, Mandalore. Just the UI stuff.

**bethany.duffy@llsa.com | 04:28**
Harry Furman. Did you guys have things you needed to look at?

**Jennifer | 04:32**
We just went over it with FY.

**bethany.duffy@llsa.com | 04:34**
Cool, you guys are... Okay, then we can jump into the UI stuff.

**Yoelvis | 04:42**
Okay, let me share my screen. Okay? I have my real device here, so yesterday... How can I get rid of this? Okay.
Small discrepancies, this one was reviewed yesterday. It's about the spacing that now we have more space here between the different elements. We discovered that I was not blind as I thought. This is not Amber, but we have a separate ticket for that, and this is not a background channel, but yeah, we need to match the step one for that detail we saw. This one...
Okay, this is the one that we were just reviewing.
This is the step package selection. So in package selection now the most popular is... We are just missing the star that's a separate detail. We have already reviewed this one as well. The icons and the tooltip in the order summary.

**Wesley Donaldson | 06:32**
Got that. What's the total in the order summary? Is that just the coloring?

**Yoelvis | 06:44**
Let me show you now. So I think it's the number that was huge and now is smaller. Let me say, the phone size 30 pixels should be 11 pixels. So now it is 11 pixels, I guess for whatever.

**Wesley Donaldson | 07:08**
Okay, I'm probably just going to add styling. One I'll add to the styling ticket. Just not to create a ticket, just to change one value.

**Yoelvis | 07:21**
What I see here is the... Okay, this is according to the... I see we modified this, but this one is still... I mean, all the other phone sizes are larger than this one, so that's not ideal.
But yeah, we have a few phone sizing details here and there.

**bethany.duffy@llsa.com | 07:49**
Can you pull up the Figma on that?

**Yoelvis | 07:53**
Yeah. I wanted to open these just to see exactly... This is a nice extension... It's size... What font you can click on, and it's going to tell you exactly this is 14 pixels. This one here is 16 pixels. I think in general the phone sizing is something that I would go one by one if I have one hour and fix all of them, probably because it's a very easy fix.
But it's annoying just to have those details.

**Wesley Donaldson | 08:32**
Yeah. Can I propose be doing that?

**Yoelvis | 08:35**
So... This is...
Okay.

**bethany.duffy@llsa.com | 08:38**
So this is what I wanted to talk about. So in this view, the order summary should have, the, actually, stigma. Yeah, well, it's almost correct. You should have the appointment information, the product information and the total.
And then the footer that's stuck at the bottom should only have the total. So we need to move the product information out of the footer in this final step because there's so much information that they have to fill out that we're trying to reduce how much space that footer is taking up at the bottom. Actually. No. This is the review.
And confirm go to the next page.

**Yoelvis | 09:19**
Yeah, I was confused here and checked out, but maybe I need to go directly here.

**bethany.duffy@llsa.com | 09:27**
The one where it said... Yeah.

**Yoelvis | 09:31**
This one, I think it's pretty close to the implementation. Do you see the everything here?

**bethany.duffy@llsa.com | 09:40**
Yeah. The only thing I'm saying is the items need to be pulled out of the footer because now we have duplicated information on the page. It should just say total and complete purchase at the bottom.

**Yoelvis | 09:54**
So... Do you mean the duplicate? This information is here and here.

**bethany.duffy@llsa.com | 09:58**
Yeah. So the requirements for this were to move appointment information and product information out of their separate components and combine them into the order summary and then leave just the total and the purchase complete purchase at the bottom.

**Yoelvis | 10:15**
Alright.

**bethany.duffy@llsa.com | 10:17**
I think...

**Yoelvis | 10:17**
The designs are...

**bethany.duffy@llsa.com | 10:20**
Yeah, it's a little confusing. Can you scroll back out on Figma? So this one should just have the footer at the bottom go to the next. Nope, that one's not accurate. Sorry, we had a different designer update this page.
So she did not do it correctly. The one after that is correct. So if you scroll two over...

**Yoelvis | 10:41**
I think you mean the checkout, the flow.

**bethany.duffy@llsa.com | 10:45**
Yeah. So if you go all the way down to the one that has all the errors at the bottom...

**Yoelvis | 10:50**
Okay, let me see.

**bethany.duffy@llsa.com | 10:55**
I don't know if...

**Yoelvis | 10:57**
Maybe it's in the flow. Let me see, because sometimes I see some things are different here.

**bethany.duffy@llsa.com | 11:03**
Yeah, okay, some like that right there where... Nope, you had it where it says, "Find locations in time up at the top." That's the checkout page, and it just has the total and complete purchase as the footer. The one more over...

**Yoelvis | 11:28**
I mean, I don't see. Yeah.

**bethany.duffy@llsa.com | 11:29**
That one is right there. That's it. Yep, right there. So it just has the total and the complete purchase at the footer. There are no items here because they can't edit the card at this point.

**Yoelvis | 11:41**
I see what you mean. Okay, just removing from here. I thought you said it was removed from the other component.

**bethany.duffy@llsa.com | 11:48**
Now just the fer.

**Yoelvis | 11:52**
Okay, alright, so this is an add. Okay, this is the last step, but in checkout, let me see what we have in checkout. Okay, yeah, it makes sense, I see it here as well. Alright, yeah, so Wesley, you can take notes.

**bethany.duffy@llsa.com | 12:11**
I'm adding a defect in the chat.

**Yoelvis | 12:14**
Alright.

**Wesley Donaldson | 12:17**
So hold on, I you all have.

**Yoelvis | 12:20**
What is this?

**Wesley Donaldson | 12:21**
I want to just do a working session where maybe you and one other engineer, we just go through it together page by page and just make the minor styling things.
I think the cycles take more time than the fixes.

**Yoelvis | 12:29**
Yeah, I just... I had that session with things in the QA. But maybe we can just go through it and there are a lot of things that we can just modify in a few minutes.

**Wesley Donaldson | 12:47**
Exactly.

**Yoelvis | 12:48**
We don't need to create a bunch of tickets for all those small details.

**Wesley Donaldson | 12:54**
I'll create one ticket with all the defects that we're tracking, and I'll do one working session. Let's make it like two hours and we'll just get together. Maybe you and Devon and maybe it's one other engineer.
But, like, I don't want to. I don't want to have a PR to change his style sheet. The me style sheet entry.

**Yoelvis | 13:12**
Yeah, Debbie, that's right. Okay, what else? Okay, yeah, it's like things like this. The font sizes are usually off and things like that, and it's better just to have consistency. This is just a super quick change.
Okay, but other than that, let me see what is in the ticket the total.

**bethany.duffy@llsa.com | 13:36**
Right? One last thing to confirm because it's not consistent in the Figma. So this is an issue in the design and things moving. I don't believe that packages are supposed to be able to be removed from the order summary. I believe that once they get to the checkout phase, you've got to remove that. Okay.

**Yoelvis | 14:01**
You're perfect. You're going to remove... Let me try just to show you.

**bethany.duffy@llsa.com | 14:07**
We must have been looking...

**Yoelvis | 14:08**
You're gone. Okay, never mind. You can't remove. Okay, that's bad. Alright, yeah, we can make this read-only like what we did in the last confirmation page. It's read-only. Okay.

**bethany.duffy@llsa.com | 14:27**
I guess I have a question there. If they change things in the order summary at this point, if they remove things, is it still doing the deduplication validation with every change, or are we only doing that validation when they quick review and confirm?

**Yoelvis | 14:50**
I don't think we need the validation for removing. The validation is usually for adding.

**bethany.duffy@llsa.com | 15:01**
But if they remove one life but not the upsell, would the $30 discount still be there? I guess you guys haven't built that yet, so that's just the...

**Yoelvis | 15:12**
It's not. It's not ready yet. Yeah, we need to that.

**bethany.duffy@llsa.com | 15:17**
Let me take that back then, because the designs are not clear. I know that initially we had talked about not being able to make any changes to the product or the appointment from that page itself. You would have to go back and change it, but it looks like the designs got adjusted a little bit, so I will get clarity on that.

**Yoelvis | 15:40**
Yeah. And for now, this is what we got the first year free. We don't have the discounts yet, but we have the tickets, so. Yeah. Okay. This is that. This is it for this ticket m we can move it to complete, right?
Yeah, alright, let me see. Okay, this is a other ticket that is related.
Okay? This is not bald. This was not ball. But in design is BA and in the implementation it's not bald. So I don't know, maybe. Yeah, me missed this one. I don't see a boll here neither.

**Wesley Donaldson | 16:57**
It's fine. If you want to just put that back in process and assign it to me, I think I'm probably just going to hand this to you to follow up. I actually know this is the same problem that we had in the working session.
So I would still push this back to in process, but my plan of attack here is to just do it instead of the working session. It's just the bowl styling.

**Yoelvis | 17:25**
Yeah, the thing is, if we move this back, okay, I can't do that. I remove it to in process, and I can add a comment.

**Wesley Donaldson | 17:35**
Please.

**Yoelvis | 17:36**
The first...
Okay. Second requirement. Please fix error warning. Are different from design, okay? The idea is that the error warnings should match the design. Let me see what we have in the design. I don't know if it's that this was not merged or something because, yeah, it was merged, but I still see the previous design here. This is a sandbox.

**Wesley Donaldson | 18:28**
[Laughter].

**Yoelvis | 18:30**
Yeah. Because the idea is that the design is more like this. More like strong, stronger. The color and here is lighter, but it's still lighter. I think he implemented this. I don't know why I don't see it in the actual deployment.

**Wesley Donaldson | 18:54**
Yeah, I think it's the same solution. Let's... I'll bring it back to Jeremy and just see where the gap is. I don't want to interrupt his recurring work, so this is probably a lower priority, but we'll tackle it for next.

**bethany.duffy@llsa.com | 19:08**
Yeah, I agree.

**Yoelvis | 19:15**
Yeah, okay, because he did a lot of changes, but I don't see those specific changes, okay? What else we have here is those colors, these... This thing is like air warning. Okay, the confirmation page should be 11 pixels
if 30 pixels. I'm going to review that later, but summary on Cha Beage is more compact. Yeah, I think something happened with that ticket that maybe it was not deployed or something because I see all those issues still here. LIKELINE screening should take the user back to the home page.
This is doing nothing. Okay? Is probably nothing. With the deployment it should...

**Wesley Donaldson | 20:31**
We emerge. Yeah.

**bethany.duffy@llsa.com | 20:33**
It should actually take them back to believe. Lifelinescreening.com.

**Yoelvis | 20:46**
Is it flying sandbox or...? I don't know if we made some changes in the life in the blue-green deployment or something, but...

**bethany.duffy@llsa.com | 21:00**
No, I want to say I think it's in the requirements. I can double-check, but I'm pretty sure we said that the logos should take them to lifelinescreening.com instead of taking them back to the first step.

**Yoelvis | 21:13**
Yeah, that's what we have in the ticket. But I don't see it working. Yeah, I think he implemented that, but the ticket was merged. It's confusing, but one bill failing, maybe it's something failing in the deployment bill, I don't know, deploy death is failing, something like that.
Yeah, so maybe we need to review that later. So for now, this is not reviewable. Okay, the reply... None of the changes are in.
Okay, maybe this is work in progress. We need to take another look because none of the changes are working basically. But he did create the PR. It's probably the builder is failing.

**Wesley Donaldson | 22:28**
You had one ticket and review. Excluding the caveat of the issue that we need for the DM, the DBAS, or for the gateway API, do you want to share anything you want to share on this?
The 15-minute ticket. You already mentioned the bug that we have.

**Yoelvis | 22:50**
No, I think we are good now because we spent more than 15 minutes in the meeting on purpose, so we should be able to validate that.
Here, for example, is 01:41 1st 2823.

**Wesley Donaldson | 23:08**
4114 and all ones. Yep.

**Yoelvis | 23:20**
Okay, so now if I complete the pushes, which should validate the 15 minutes, the lock appointment happened at 15:09 and 15:25, so it should be... Okay, is searching the screening and it's failing? Why it's failing is basically we have an issue in sister APIs, I would say the Jennifer is...

**bethany.duffy@llsa.com | 24:02**
A half-hour bug where it's locking it for four plus hours.

**Yoelvis | 24:07**
Yeah, I think I did some testing and I think it's not four hours because I tested one hour after it was... I was getting this issue and after one hour it was working. So I don't know exactly what's the rule, but it's not fifteen minutes.
That's the thing.

**bethany.duffy@llsa.com | 24:30**
Okay, thank you for our DBA team to look into that. So I'm curious, are you hitting I'm assuming you're hitting our lower environment for the screenings.

**Yoelvis | 24:43**
I don't have that information.

**Wesley Donaldson | 24:47**
It should be. I mean the PR environment should be hitting the lower environment that was part of the original requirement for the API.

**bethany.duffy@llsa.com | 24:49**
Yeah.
Okay, I'm curious.

**Jennifer | 24:57**
One did say it was still happening on fraud. I can't... We probably should confirm it, but someone said that at one point.

**bethany.duffy@llsa.com | 25:06**
That was going to be my question as to if it was just what...

**Yoelvis | 25:09**
I would like. I would like this. To this endpoint to return the. The date expiration date that would be awesome. Expiration date the time because that way we don't need to guess, we can just use that.
But yeah.

**bethany.duffy@llsa.com | 25:26**
That just requires a lot of changes that I am not comfortable doing.

**Yoelvis | 25:34**
I don't know why we are so scared of the legacy.

**Jennifer | 25:38**
The time that is being set isn't in the code, it's within the DB so sending you back a time would just be guessing as well.

**Yoelvis | 25:50**
Alright. But... I mean, it's in the DB. Everything is in the DB, we should be able to query the DB and get that. But okay, never mind. The thing is it's not working with... It's not 15 minutes for sure.
So most of the users, when they get to this step after 15 minutes, they are going to see this error, and that's not nice. Okay.

**Jennifer | 26:18**
Yeah. All right, can we confirm that this is happening in production as well?

**Yoelvis | 26:28**
What do you mean?

**Jennifer | 26:29**
Like a separate endpoint? There's a separate endpoint that you can use to hit production. I think it's honestly changing a T to a P in the endpoint and then we can see if the production one is working.

**Yoelvis | 26:47**
All right, yeah, let's do that.

**bethany.duffy@llsa.com | 26:50**
Yeah, I think it's...

**Jennifer | 26:51**
I would just help the DBAs know what they need to change.

**bethany.duffy@llsa.com | 26:56**
Yeah, you would have to change the appointment time that you're grabbing. That would have to hit production and then the appointment lock would have to hit production if they're separate endpoints.

**Yoelvis | 27:08**
Alright, sounds good. So that's the fifteen-minute... As you can see at the 15-minute, it's showing the thing that message you can pick new. It's going to search again. I am preserving the same DA, the same input here, the location, and searching again so I can...

**bethany.duffy@llsa.com | 27:41**
This looks good. In the event that the DVAS can't fix the problem before a launch, is it simple to pull the appointment lock check out because it's something we can just comment on now and not do as a validation step?

**Yoelvis | 27:59**
Yeah, we can't do that, absolutely.

**Wesley Donaldson | 28:01**
I would change the requirement to be... Let's add it as a feature flag.

**bethany.duffy@llsa.com | 28:05**
Okay.

**Jennifer | 28:06**
I was just about to say the same thing.

**bethany.duffy@llsa.com | 28:10**
Yes, let's...

**Yoelvis | 28:11**
Are we using some feature flag systems?

**Wesley Donaldson | 28:16**
Yes, we're using... Yeah, we did around... We added that a month ago.

**Jennifer | 28:17**
Not yet. We are...

**Wesley Donaldson | 28:23**
At this point,
it's only servicing the release trend and the release notes functionality. But we're only using it as configured. But it's the same functionality. It's just a flag that we can pass by environment.

**Yoelvis | 28:38**
Yes, it's a flag, but what is the system and what are we using?

**Wesley Donaldson | 28:46**
It's an as.

**Yoelvis | 28:50**
Yeah, I would say that's not ideal.

**Wesley Donaldson | 28:53**
Yeah.

**Yoelvis | 28:53**
We should...

**Wesley Donaldson | 28:54**
It's not like...

**Yoelvis | 28:54**
I think I have a ticket for that, but my feedback would be that it's not ideal for the front end. For the front end, we need a platform that anyone can use.
It's easy to use, launch directly, or something around that, and then anyone can use that, and we can create A/B testing, and we can do everything that is nice with those platforms, but relying on... Is the most painful.

**Wesley Donaldson | 29:12**
And I don't exactly.

**bethany.duffy@llsa.com | 29:24**
There was a tool that we were already paying for via marketing that we could use now. I'm remembering all these conversations, and I don't remember...

**Yoelvis | 29:35**
Let's try. Let's try to use something that is nice for everyone, including pro or anyone to toggle the features allow us is to I don't I haven't had a good experience with Fisher Slack in NWS, especially for pro people and everyone else.
It's not great in general.

**bethany.duffy@llsa.com | 29:57**
Yeah, okay, I do have to jump over. So my concern with that is just I don't want the bug holding up our production launch, and I don't want a bunch of people having to... Or not being able to check out because their appointments are locked.
So whatever. If we can make a decision really quickly on a user-friendly tool to do that, awesome. If not, then let's move forward with what we have in AWS just for this one so that we can meet our production deadline.

**Wesley Donaldson | 30:27**
Can we raise the question?

**Jennifer | 30:28**
We have to. We can with what we have, no matter what. We talk about a better solution. You and us are going forward.

**bethany.duffy@llsa.com | 30:38**
Alright.

**Wesley Donaldson | 30:39**
Sorry, let me rephrase the question. Do we envision a situation where we'd actually turn this on in production, like if we just remove the feature or is the goal there?
We want to test it in production with real users and then turn it off if we see a problem. My...

**bethany.duffy@llsa.com | 30:53**
I want it turned off if I don't have proof from the DBAs that they fixed it by the time we're going to prod. I am just putting in a security measure right now because our DBA bandwidth is very limited.
So my confidence level in them figuring out what's wrong and solving it is low before we need it to be live.

**Wesley Donaldson | 31:17**
Gotch. You.

**bethany.duffy@llsa.com | 31:19**
But this is a feature that I want, so I don't want to throw away the work that's already there.

**Wesley Donaldson | 31:25**
Got you.

**Yoelvis | 31:25**
Yeah, just... I can tell you. You can just let me know and I can do the make the change very quickly to disable that until we have a proper fission Slack system serving the front end.

**bethany.duffy@llsa.com | 31:42**
I still do want to be testing earlier on now to see if we feel that if we see the issue still happening in the production endpoints because there are sometimes discrepancies between the legacy environments.

**Wesley Donaldson | 31:43**
No.

**bethany.duffy@llsa.com | 32:01**
So it could be just a configuration thing in the lower environment so we can confirm that it is in fact still happening in prod. Then I would say let's turn it off until I get confirmation that the DBAs have corrected the issue.

**Wesley Donaldson | 32:12**
The... Was someone to create the ticket for us to make it triggered by the config? Then we can punt the... You can do the investigation and we can punt the decision for next week. At least we'll have the feature.

**bethany.duffy@llsa.com | 32:28**
Sounds good.

**Wesley Donaldson | 32:30**
Right?

**bethany.duffy@llsa.com | 32:31**
All right. Thank you.

