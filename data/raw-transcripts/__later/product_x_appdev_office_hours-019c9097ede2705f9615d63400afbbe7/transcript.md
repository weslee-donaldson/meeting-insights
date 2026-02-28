# Product X AppDev Office Hours - Feb, 24

# Transcript
**Wesley Donaldson | 00:13**
Is the architive. 
Hey, Beth. Only one item I didn't see Nick post in the channel in the chat. So it's asking to join, to get direction on the footer.

**Speaker 2 | 00:47**
No.

**Wesley Donaldson | 00:49**
Just waiting for him to join us.

**Speaker 2 | 00:55**
If you want, we can start with the pre purchase validation. Never mind. Next here, we can start with this.

**Wesley Donaldson | 01:11**
He.

**Speaker 3 | 01:16**
Yeah, I mean, question. Same question that I posted in chat.

**Wesley Donaldson | 01:23**
And then I missed that.

**Speaker 2 | 01:26**
Yeah, I did not see a question.

**Wesley Donaldson | 01:28**
Yeah, maybe I've been looking in the wrong area.

**Speaker 3 | 01:32**
Ambush met and they have posted it in the wrong place.

**Wesley Donaldson | 01:37**
You post it in general. Good morning. I have a couple of. Yeah, you posted it in general. 
I'll just copy it here for us. Chat. There you go.

**Speaker 2 | 02:02**
All right, so what is the expected behavior style for the e commerce app footer on Desktop?

**Wesley Donaldson | 02:08**
We must be, I think, a visual help here.

**Speaker 2 | 02:09**
Okay's not a.

**Wesley Donaldson | 02:16**
Nick. I mean, I think your question is rooted and we have kind of like the totals being anchored to the bottom, but we have the foot. Or do you want just show the visual of what you do? You currently have.

**Speaker 3 | 02:29**
Well, I mean, that that's kind of the problem. Hang on just a second. Let me get Figma pulled back up. There's not a design and Figma. Well, there's not a design and Figma for the Desktop first, but yeah, I guess we could start there.

**Speaker 4 | 02:52**
I mean, I was. I was under the impression that the footer only displays in mobile view.

**Speaker 3 | 03:00**
Yes, I don't know.

**Speaker 5 | 03:02**
I really asked Greg a few days ago on the Ummphima. He told me that yes, we need the folder on Desktop and he was gonna add it. Maybe he forgot he's working on something else, but, whatever. But we can doubletiate with him, but I would assume it would be just similar to the folder that we have on mobile just by, some twigs. Just added some twigs. 
Like, instead of everything a stuck one over the other. It could be horizontal or something like that, but the idea is gonna be. It's gonna be the same. It are gonna be the same links, the same, social links as well. 
And we are going to redirect the user so you can go to the live screening e homepage and you can grab the links from there and use the same links in your new disc.

**Speaker 3 | 04:06**
Okay?

**Wesley Donaldson | 04:06**
Three.

**Speaker 3 | 04:06**
I just. I always know what I know what always happens when I assume it never turns.

**Speaker 2 | 04:12**
Yeah, I'm just notating this in that chat. Buter link should redirect to existing pages on lifelinedscreening.com.

**Wesley Donaldson | 04:29**
Those should be relative, right? Beth? Like we want to make sure we're not sending dev to production.

**Speaker 2 | 04:37**
Correct? Yeah, it should. It should be the same environment, like if you're developing in sandbox, it should be to e com sandbox, legacy sandbox, and then if you're in production, it should be like production.

**Wesley Donaldson | 04:55**
So.

**Jennifer | 04:55**
I think we can focus the requirements on production.

**Wesley Donaldson | 04:55**
Form.

**Speaker 5 | 04:59**
Yeah. And that.

**Jennifer | 05:02**
We build out.

**Speaker 5 | 05:03**
Keep.

**Jennifer | 05:04**
Make sure that we do the correct thing for the different environments tech wise.

**Speaker 5 | 05:13**
And then it was simple. Sure.

**Speaker 2 | 05:16**
Yeah. And then for the expected behavior for the photoer on mobile, I would say the fooer should be the static content all the way at the bottom. So if you scroll all the way down, then you would see the footer and the cart should remain sticky on top of that.

**Speaker 3 | 05:41**
Okay, sorry it took me a while to find the right fig, the right Figma link. Okay, so like, all of these. There's no footer. So I didn't know.

**Speaker 2 | 05:56**
Yeah, it should just be. If you scrolled all the way down on that page, then you would see the footer and it should come up above the sticky cart.

**Speaker 3 | 06:06**
Okay, up above the sticky. Okay.

**Jennifer | 06:09**
So would be above.

**Wesley Donaldson | 06:11**
Below the sticky cart.

**Speaker 2 | 06:14**
So below the underneath it should be. But what I'm saying is when you scroll all the way up, it should stop. Like the bottom of the footer should stop at the top of the sticky cart. Because there's experiences that I have on mobile where I scroll and the sticky thing blocks whatever's underneath itmm. 
So that that's.

**Speaker 3 | 06:36**
What I'm that's what I'm just wanting to make sure of. Okay, yeah.

**Speaker 2 | 06:41**
So we just want to make sure that it's still accessible while being like the last static thing underneath that sticky part.

**Speaker 5 | 06:50**
I think one very simple trick to do that without too much calculations. It's like using the position as sticky. And there is there are some workarounds to make it work. So yeah, that's, for the I mean for the summary that we have in the at the buttom instead of using position fixed, we could use position sticky, and that way it won't affect the content that is underneath. 
But we may need to use something like a portal or something like that just to make it work with CSS but that's a simple thing. The other thing is you can just add e enough space that you would be confident that we will never be the other section is not going to be over that one. 
So you can use a pattern that is good enough for. For that. And that's it.

**Jennifer | 07:51**
So, Beth, do you want, the sticky like cart to be able to, like, close and open to see the footer? Or you just want it to stay open and have the footer, like, kind of be above it?

**Speaker 2 | 08:09**
Yeah, it should just stay open and the foer should, like, snap to the top of it, if that makes sense. Okay.

**Speaker 3 | 08:24**
All right, well, that takes care of my question.

**Speaker 2 | 08:27**
Okay, awesome. I don't know if you have a ticket. You're working off of that. We can copy paste those notes into.

**Speaker 3 | 08:38**
Five ninet 5.

**Speaker 2 | 08:40**
595. Okay, a second, I will. Yeah.

**Speaker 5 | 08:42**
Those there the other behavior that is important for footers in on Desktop is like the footers should always be at the fuller at the end of the page. Because sometimes when you don't have enough content in the body, for whatever reason, the f is gonna be up, you know, in, like in the middle of the page. 
And you need to test that GE case to make sure like it's at the always a minimum if the content is bigger than the viewport high. Okay, the poor is gonna be down, but.

**Speaker 2 | 09:28**
All right, I just added that to the Description of your ticket so it's documented there like. All right, now I want to run through this one pretty quickly. I don't think there's too much here. From a business perspective. 
That's so complicated. So. If're over here. 
Okay, so if they're over here, before they can click complete purchase at the bottom, we need to validate that everything inside of here has been filled out correctly and they're not missing any information. 
So what that means is the payment information should have all the fields filled in the correct format. Same thing with billing info participant info. The terms and conditions have to be accepted. There must be an appointment and there must be at least one package inside of the order. 
If any of these are not true, then that complete purchase button needs to be disabled.

**Speaker 5 | 10:42**
In general, I don't want, to be. But in general, it's like the buttons, it's a base. It's a best US practice not to disable buttons, but the user could click the button, and if the user hits the button, we display the errors. 
I mean, in general, that's the best. Yeah, I know, but it's like. What's the approach here? Is every t are we displaying on Bluur or when you hit the submit button?

**Speaker 2 | 11:22**
I don't think I understand the question.

**Speaker 5 | 11:24**
Okay, when on blue ramming? We are not. When you come to this page, we are not going to display everything in red because that's a horrible experience. So the user start typing. And if the user clicks out of the input. 
Okay, we can validate that particular input, but let's say the usage just go straight to the, complete, pushes. Then we display all the required items are as red. That's a common practice. So if we disable that, button. The user may have a hard time trying to figure out what are all the required fields and things like that. In general, the best practice is just to keep the button enabled. 
If you use a click it. Okay, we display on red everything that is not red right now at the moment.

**Speaker 2 | 12:15**
Okay, I can change that. So.

**Speaker 5 | 12:20**
Now I want to know if anyone agrees. It's like where I where I usually see. And as you're right, as practice.

**Speaker 7 | 12:27**
You're right. You shouldn't come in and see everything read.

**Speaker 2 | 12:31**
Yeah.

**Speaker 7 | 12:31**
I agree that it's just when the user clicks into the field and then when they leave the field, their cursor leaves the field. That's when you do.

**Speaker 5 | 12:38**
Those checks and in case they hit submit. Okay, we are gonna display and read everything that is still pending.

**Jennifer | 12:52**
Yeah, I agree.

**Speaker 5 | 12:54**
And we are using a library. I ask Jeremy to use the to try react hook form and with that library is like very straightforward or everything I mentioned is by the file walking on with that library. Thanks.

**Speaker 2 | 13:14**
So we don't have a mopup for, like, if they're missing products or if they're missing the appointment. I don't even know if that's a possible scenario for them to get here.

**Speaker 5 | 13:28**
No, that's not possible.

**Speaker 2 | 13:30**
Okay.

**Wesley Donaldson | 13:31**
Hold on it is possible because like you all this they can manipulate the session object if they are inclined. 
So we should make the assumption we're validating everything we need to move forward in the process, independent of if it could or could not happen. We should validate everything we need.

**Speaker 5 | 13:48**
Yeah, of course we are doing the validation. But what I mean is like, in general, unless there are a hacker or something, they shouldn't get to this page with the bad state. But we are still validating. 
I have a ticket for that. And we are gonna do it validate the business rules and everything. And in the back end, we are going to validate as well to make sure that we are not using abusing the API.

**Speaker 2 | 14:23**
Okay, so I don't have Designs for now. If an appointment or product are missing, what would be your preferred approach without those designs? Can we just use Stri Co? No, it's not in this video.

**Speaker 5 | 14:45**
It is like, I don't think we need to be super specific for the H case of the hacker trying to hug around. If they are hugging, they should see a generic a like it's like novel and an MPP that I was I would I wouldn't focus on that for the mpp.

**Jennifer | 15:04**
I agree. If, like, we could have something that like if there's not an appointment selected and I know it's not a normal case. Like we could have something simple there. Like, there could be hackers, or there could just be someone that goes in and clears their brout, like, clears their session data and all of that stuff. 
Like, you can clear your cookies pretty easily. And that could be like someone that's not like hacking or whatever, but we could just have like an empty state for each of the sections. But outside of that, like actual validation should only have to be done on the API like we don't have to validate in the car at all of those products and everything. 
So we could just have like some empty state and then have that be it.

**Speaker 5 | 15:52**
Yeah. I just wanted to add that if the user comes to the last page and they don't have data in the in session storage and they refresh the grocer, they would be redirected to the first pagem. So we are trying to take those cases into consideration just to try to avoid the errors as much as possible.

**Speaker 2 | 16:19**
Yeah. 
Okay. So if they don't have an appointment or products, you're just saying return an error that says something went wrong.

**Jennifer | 16:57**
I wouldn't even say an error. I would just have like some empty state like no appointment and no products and like let the API response be the error because it is an edge case. Just have something where it's not going to like make the screen look like blank or JavaScript or something like that.

**Speaker 5 | 17:24**
For me, one of the more common errors that could happen is that the appointment was taken.

**Speaker 2 | 17:31**
That is on the complete purchase validation. So that's over here. That we will talk about later today. 
Although now we're talking about. I split it out because I had gone with the assumption of disabling the button, so may maybe now they're all the same thing. But this is like before you tried to submit the order request. Is all of this stuff valid? 
And then this is as we're submitting the order request.

**Wesley Donaldson | 18:18**
So you all that this the pre isn't that this is basically our on page load test. So we already have this then.

**Speaker 2 | 18:32**
So we just need to move this validation to the complete PCHA of the button is what you're saying.

**Wesley Donaldson | 18:38**
No. So you all this what we talk about, what you just mentioned was this idea that we check to make sure the basic information paint, packages, screening, location, all those are provided before we render the review page. 
So that's the prevalidation. And then.

**Speaker 5 | 18:54**
Yeah.

**Wesley Donaldson | 18:55**
So then this is. I think be. What I'm saying is. Sounds like this ticket's already done.

**Speaker 5 | 19:00**
If the user comes to this page and to the package page of the review page whatever page, I am doing a validation. If the Sustan store is not including the information that we need, I am redirecting the user back to the right step. 
So that's the a scenario. When the user goes and clear the cache and then refresh the browser, then we redirect the user back to the appointment. So we are making we are just trying to make sure that we are not in an invalid state.

**Speaker 2 | 19:34**
Right? 
What I'm saying is I don't think the validation that was done for this form fill is attached to the complete purchase button. I'm just making that assumption that wasn't done.

**Speaker 5 | 20:05**
I need to review with Jeremy.

**Speaker 2 | 20:10**
Okay, so I will leave this as it is, and if most of it's done, then awesome. But these are still requirements that must be met.

**Wesley Donaldson | 20:21**
Nope. Can you scroll up? Is this the pre 1 or the button one?

**Speaker 2 | 20:25**
Yeah. So this is pre purchase validation?

**Wesley Donaldson | 20:28**
Okay.

**Jennifer | 20:28**
I don't know when Jeremy's going to be back. Hopefully tomorrow, he said, but it depends on when he gets power.

**Speaker 5 | 20:37**
Yeah. I was gonna ask. I was asking Wesley today because I've been reaching out Jeremy to Jeremy and getting no answers.

**Jennifer | 20:49**
Yeah, he's in Massachusetts, and they just had 30 inches of snow, no power for two days and a travel ban. So you get somewre with power. I know, right? Whereas I'm here, like, sweating like where I like, I feel so bad for. 
Well, kind of you. Here, if you wanted. You need a full and brown.

**Speaker 5 | 21:13**
Yeah, they have a blizzer there.

**Speaker 2 | 21:19**
Yeah, that's like an avalanche of snow.

**Jennifer | 21:23**
We don't even get like literally the Definition of a Desert. I think it's 7" of rain or snow or whatever like. And he had got 30 inches in a day. Like go yeah, I can't even imagine.

**Speaker 5 | 21:39**
Yeah, I think for today I can't I think I see Jeremy Mer something yesterday. So for today, I could take, like, I think that's the plan that Wesley is gonna come with. It's like I gonna take care of the checkout page so I can just finish the. Everything we have in the checkout page. Try to finish it today and see how to integrate with lens work and we can have something working by tomorrow.

**Wesley Donaldson | 22:09**
Yeah, do you want to sign this to?

**Speaker 2 | 22:09**
Got it?

**Wesley Donaldson | 22:13**
Well, you already have to go all us. That's fine. 57 what.

**Speaker 2 | 22:16**
Okay, this ready for Dov Allr. So basically the split here is this is everything before we even submit that order creation request into Rick Curly, all the validations that we're doing in order to get to that point. 
And then the one that we'll review later today because I still need to run through this just internally this will be everything. All right, now we're ready to submit that request to RI Curly. What happens with these things? Actually, I with that thought process, I think the appointment availability needs to be moved because we can the appointment availability before submitting the request to recuurly makes sense.

**Wesley Donaldson | 23:02**
Can we check that?

**Speaker 2 | 23:04**
Yes.

**Wesley Donaldson | 23:06**
The API endpoint we have in the Gateway API doesn't have a method like it has a method for listing availables. But we would have locked the appointment at that point, so he shouldn't come back as available.

**Speaker 2 | 23:17**
Yeah. So I will drop that in here in the tech consideration. So basically what's going to happen is if it's been 15min or less since the appointment was selected, you can proceed with assuming that the appointment is available. 
If it's been more than 15min, you'll need to do the get on the screening endpoint again and see if that appointment is in there. If it is, you can proceed. If not, then you'll choose the next closest appointment time from the same event.

**Wesley Donaldson | 23:37**
Nice.

**Speaker 2 | 23:42**
And if there that event has no other appointments, then we'll need to let them know the appointment is no longer valid and they will need to select a new appointment.

**Wesley Donaldson | 23:50**
Okay, that makes perfect sense. The choose the next available appointment. That sounds like a bit of a flag to me, like we would choose it on the user's behalf. 
If it's within thirty minutes within. It feels like we need to have a little bit of a, additional business rule there, because if it's within two hours, as an example, that's probably not doable for the user.

**Speaker 2 | 24:09**
I think we can just display a message that says your appointment was no longer available. We've chosen the next available appointment time for you and display what that appointment time is. 
And then they can continue or they can choose to continue complete purchase or go back.

**Jennifer | 24:26**
So that we agreed on in the refinement because I thought we said we weren't going to choose because the business requirements were too difficult for that.

**Speaker 2 | 24:38**
I remember saying we would choose the next closest appointment time in the same event. But if there were none available in that event, then we would have to kick them back to the screening selection. I can move this as its own separate thing if we want to pull it out. For now.

**Jennifer | 25:02**
I say, like, the first step should just be like, let's just assume that there are no appointments and like, let's do it. Where there we don't re select an appointment for them and we just make them reselect. 
And then let's talk about like the exact business requirements around what choosing would mean. Because is that the next is it before like. Okay, it was right as in the closest without going over.

**Speaker 2 | 25:36**
Okay, so are you good with this first round being? Sorry, the appointments selected you select is no longer available. Please select a new one. And then they have to go back to the screening selection and start over. 
Yeah. Okay.

**Wesley Donaldson | 25:53**
Is it over?

**Speaker 5 | 25:53**
It is kind of sad because they will have to.

**Wesley Donaldson | 25:54**
Or is it just like a new time? Like. I guess my question is more, are we persisting the current information they've already provided? And they're choosing a new time. 
But then that would make it more complicated because we would have to validate. Maybe they chose a different location.

**Speaker 2 | 26:07**
Basically, what I'm saying is they have to start the process all over again if the appointment's not available.

**Wesley Donaldson | 26:11**
Yeah. I think that's good. For the one.

**Jennifer | 26:14**
Yes, yeah, I like it sucks for people, but just. I've been in that experience so many times where I've had to restart and it's like AA sucks, but you still do it. And it's not like abnormal for a business to do that suck. But. 
I just want to make sure we have the rules right around that selection.

**Speaker 2 | 26:45**
Yeah, that's fair. And I don't want to have to solution right now without vetting with designed. So for right now, we'll just kick them back to the screening selection page.

**Jennifer | 26:55**
Okay.

**Speaker 5 | 26:57**
From the technical perspective, are we clear about how to approach the fifteen minute timeout? Is that something we are gonna do? Client size, server S or how is anyone.

**Speaker 8 | 27:12**
It sounds like the check's going to have to be on the server, so we will have to store the time at which they reserve the appointment, ask that to the server and then do a gate check. I know we talked about this yesterday.

**Speaker 2 | 27:31**
I thought we said we were going to store the appointment selection time in local storage and then check if that's been. If it's been more than 15 minutes. If it has, then you would do a get on the screening end point.

**Jennifer | 27:46**
Yeah, client's side should be fine for the 15 minute check.

**Speaker 8 | 27:55**
Maybe it's still beyond scope, but we have the session ID that we locked it with, we have the appointment to it. And I mean, I guess it's reliable to just trust for 15 minutes, but I mean, I just want to add an endpoint to check this explicitly.

**Jennifer | 28:19**
Add an endpoint to what?

**Speaker 5 | 28:22**
The gateway a.

**Jennifer | 28:25**
To check if they still have the appointment. No, we don't. We just want to go with the basic. We hope this is right.

**Speaker 5 | 28:42**
Yeah, it would be ideal to have something like that and maybe to even release the appointment if we are no longer using it. But yeah.

**Speaker 2 | 28:51**
That's long term. So once we move appointment maintenance in general outside of CTAR, all of that can be refined and fine tuned. We don't want to touch what's already there.

**Jennifer | 29:05**
Don't want to mess with all of the other stuff that's going on with CSTAR and other side effects that could happen. Yes. So basically, if like the only check that we're doing is if it's within that fifteen minutes or not. 
And so we can trust the client side when we made that appointment for that for like the fifteen minute check. And then I think we have some manual stuff going on if the appointment is double booked, but we're just trying to make it where that's the least likely to happen as we can with what we have.

**Wesley Donaldson | 29:57**
That makes sense to me. The.

**Speaker 2 | 30:07**
All right. Did I finish writing that? So appointments not available display message or selected appointment time is no longer available. Button to select appointments and redirect to the screening appointment page.

**Speaker 8 | 30:32**
Are we checking that server side know?

**Jennifer | 30:37**
Because right now if you try to lock an appointment like if you call the endpoint to lock an appointment somewhere, it doesn't even matter. Like Legacy or CSTAR or whatever. It's just checking to see if there has been an appointment made on that, but it's not even checking to see if somebody else has the appointment locked. 
Like. So there's no failure that's going to come back from that. If you've already locked the appointment and it's still locked. Like you could technically lock that appointment multiple times. You.

**Wesley Donaldson | 31:19**
But I think the concern would be the fifty my concern would be the fifty minute window. So it's going to take a minute or two to complete the checkout process. If the system, the upstream system is going to purge the lock, it's a very edge case, like with someone take that lock. 
But you're basically saying it's okay for multiple people to have it in the real world environment. It's okay for multipogle to have the same date time of an appointment.

**Jennifer | 31:45**
I'm saying that it's inevitable. Not okay until we fix the whole thing.

**Wesley Donaldson | 31:49**
Okay.

**Jennifer | 31:54**
But we're not going to fix the world right now.

**Speaker 8 | 32:00**
Unfortunately, we have a distinction of what we're checking on the client but validating on the server. Or are we not doing server validation?

**Jennifer | 32:21**
There is no server validation that we can do.

**Wesley Donaldson | 32:28**
Not specific to locking, but I think we'd agreed earlier that we would service.

**Speaker 8 | 32:31**
Yeah, I meant the other stuff.

**Wesley Donaldson | 32:33**
Okay.

**Jennifer | 32:33**
The other stuff. Yeah, sorry.

**Speaker 8 | 32:35**
So everything except the locking?

**Jennifer | 32:38**
Yeah.

**Wesley Donaldson | 32:38**
I sorry. I have to run.

**Jennifer | 32:44**
We can talk through that if you need to. So sorry. I was focused.

