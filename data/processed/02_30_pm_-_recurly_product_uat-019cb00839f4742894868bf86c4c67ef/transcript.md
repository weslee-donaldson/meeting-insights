# 02:30 PM - Recurly Product UAT - Mar, 02

# Transcript
**Wesley Donaldson | 00:06**
Good afternoon. Good morning. I always find it fast to get the right time zone.

**greg.christie@llsa.com | 00:13**
Yes. Yeah. Are you on West Coast time to us?

**Wesley Donaldson | 00:17**
Now East Coast. You may see a couple of things from me early in the morning because I start a little early, but now East Coast, I am in Atlanta, Georgia.

**Jivko Ivanov | 00:19**
Okay.

**greg.christie@llsa.com | 00:30**
Okay.

**Wesley Donaldson | 00:32**
Okay, folks, I've invited Jeffco to this as well. Intentionally. Tried to keep it a little bit light. Just to. Could have engineers still kind of heads down to getting work in. So you should join short shortly.
If I can get started again. Y' all of us if you want to be our Miro d nice.

**bethany.duffy@llsa.com | 00:53**
Actually, I would love to step through the UI myself and kind of guide it, so let me pull that up.
Okay? I'm in incognito because I wanted to pull fresh and not have any of my stuff cached. So I want to... First of all, is Sandbox up to date with all of the changes? Is there anything that's outstanding that should be in here and is not?

**Jivko Ivanov | 01:30**
I did not see my latest changes here, not sure if they have been deployed.

**lance.fallon@llsa.com | 01:36**
I know Jeremy's latest changes at the confirmation page with the dynamic text and that is still trying to get out of the code is complete, but there's a step in the PR pipeline that's failing.

**bethany.duffy@llsa.com | 01:52**
Okay. Then, jbro, what do your changes consist of?

**Jivko Ivanov | 01:57**
As I mentioned earlier today, that was the dialog. The restriction dialog. It's dynamic based on the JSON file is posted to chat. As you pointed out, it's not the correct JSON, but it shouldn't be there all the time.
When we went through the review earlier today, it was there then.

**bethany.duffy@llsa.com | 02:16**
Okay, what's not there? So with that in mind, I'm going to point out stuff, and then you guys can let me know if it is something that you've already identified but haven't worked on yet. Then that way we can prioritize what needs to be done by Friday. Greg, I would love your input here because you're the one who's going to be showing it to the board.
So things that you think are very prominent and things that we should work on first, let's just make sure that we're getting that done.

**Wesley Donaldson | 02:42**
Sorry, let me... Beth, unless you're opposed, let me record a session so it's easier for directing. Yeah, cool.

**bethany.duffy@llsa.com | 02:52**
All right, so this page, I've only seen some minor things, actually. Let me throw this into a mobile view really quickly. So just in mobile view, the buttons are not the right size. They shouldn't be stacked like this. They should all be in one line. I don't know if that's something we've identified.

**Wesley Donaldson | 03:26**
Sorry that trying to swallow something? No, there's. There's no ticket currently for that.

**bethany.duffy@llsa.com | 03:32**
Okay. And then I think this behavior is more of a UX update. Honestly, most of the appointment stuff is looking really good, so it's really just nitpicky at this point. I'm not seeing anything huge that has to happen there.
Unless... Greg, do you want to get the hiding map feature in before Friday?

**greg.christie@llsa.com | 03:54**
I don't think it's essential. It is a pretty quick one. If anyone can pick it up... But I would say in the grand scheme of behaviors, I put it at a medium priority.

**bethany.duffy@llsa.com | 04:09**
Alright, so we will move forward. This page, the packages, was my larger concern. Okay. So this is still not pulling from Recury, which is a big concern for me. Obviously, these prices are not correct.
So where are we at with that?

**Wesley Donaldson | 04:40**
Jeff, I think that one is yours.
You're talking, you're on mute.

**Jivko Ivanov | 05:01**
Sorry, I... Yes, so I'm looking here. Yes, that's what we discussed a bit earlier with Beth. I just need the discussions here. We'll have code them. That's going to be a new ticket.

**bethany.duffy@llsa.com | 05:18**
Is that correct? But this... No, this should not be a new ticket. This is part of the initial scope that we should be grabbing the name, the description, and the price for our Hurley. So this is not a new ticket.

**Jivko Ivanov | 05:27**
So I thought for the assessment.

**bethany.duffy@llsa.com | 05:30**
No, I'm talking about this here.

**Jivko Ivanov | 05:33**
Right. So is that not from the record?

**bethany.duffy@llsa.com | 05:36**
No.

**Jivko Ivanov | 05:37**
Okay, I'll check on that.

**greg.christie@llsa.com | 05:40**
Yeah, I would say this is probably the highest priority. Yeah, this is more. More than anything else, this is what we want to be able to show the board is the way that this is pulling from these things are pulling from. Cra.
Yeah.

**Jivko Ivanov | 05:50**
I was pretty sure this was point for before, but double-check maybe something changed with all the mus. I'll work on it right after this call.

**bethany.duffy@llsa.com | 05:57**
Okay. Awesome. That was my main concern there. The assessments will be hard-coded. That one, I will get you a story for that. Right now, it's just showing this message. Greg, do we want to make sure that this is hard-coded and available by Friday?

**greg.christie@llsa.com | 06:23**
Assessment details are currently unavailable from this package.

**bethany.duffy@llsa.com | 06:27**
So this is just showing the dropdown of...

**greg.christie@llsa.com | 06:30**
Like having the assessments show up there.

**bethany.duffy@llsa.com | 06:33**
Right? Like cortisol or. Man.

**greg.christie@llsa.com | 06:36**
It would be nice, but I would say let's... I would say making sure that things are like that the actual prices and things are pulling in is the key thing. And in fact, I even say making sure that the as individual assessments are pulling the, you know, like the individual tests are pulling in is probably even higher priority than the actual assessments within these things.

**bethany.duffy@llsa.com | 07:01**
Okay, that would be happening in... Okay, JPCO and I did talk about that earlier, so there's still some work there. So let's say I just select this and move on. Same thing. I want to make sure that it's actually grabbing...
That's not updating my cart.

**greg.christie@llsa.com | 07:20**
Okay, so obviously that's a problem.

**bethany.duffy@llsa.com | 07:22**
Yes. I'm just not getting that.

**Wesley Donaldson | 07:29**
You can do... What's your thought on what's the underlying challenge? There is just... Is not pushing into the session state object. It's not just because of how that's implemented. Is that still ex on the person who owns the pages to make the updates on that project?

**bethany.duffy@llsa.com | 07:45**
On...

**lance.fallon@llsa.com | 07:45**
What? What's not updated in the code?

**bethany.duffy@llsa.com | 07:49**
So I added a package and it's changing the total by $12, but it's not showing it.

**lance.fallon@llsa.com | 07:59**
On the desktop for you is...

**bethany.duffy@llsa.com | 08:02**
See. Yes, it does.

**lance.fallon@llsa.com | 08:07**
He remembers Dane bringing this up and I believed he was told to keep it as his.

**bethany.duffy@llsa.com | 08:14**
Who? That was not Aion that I gave.

**Wesley Donaldson | 08:26**
So the underlying problem here is it's not updating on mobile, but it is updating on a desktop.

**bethany.duffy@llsa.com | 08:34**
Got it? Okay, I'm going to log that one as needing to be addressed by Friday.

**greg.christie@llsa.com | 08:40**
Interesting. So it is... So it's updating on desktop and on mobile.

**lance.fallon@llsa.com | 08:46**
Yes, it's added to the cards, but it's not showing up in the list in the middle down here.

**Wesley Donaldson | 08:52**
We had a ticket from Friday, actually. That's to have synchronization between the mobile version of the footer or the auto-review and the desktop version of that. Is that the underlying problem here? There are two different components.

**Jivko Ivanov | 09:12**
So it's the same component. It's just what is hidden and what is shown, and you control that by breakpoint, by what is on mobile, what is on desktop. It's really what you guys would like to show if you want both to show the same easily. Just need the guidance.

**greg.christie@llsa.com | 09:28**
I think they are all supposed to show the same, right? I don't I can't they make cases where they're not best, you know.

**bethany.duffy@llsa.com | 09:37**
Sorry, can you repeat that question?

**greg.christie@llsa.com | 09:40**
Jeffo was saying that there's a that, you know, it's just that what's being hidden in the mobile state, it's the same component. It's just being what's hidden in the mobile state versus Desktop.

**bethany.duffy@llsa.com | 09:51**
There should be nothing. There were no requirements about hiding anything.

**greg.christie@llsa.com | 09:54**
Yeah. It should always be the same, actually.

**Jivko Ivanov | 09:58**
Okay, that sounds good.

**bethany.duffy@llsa.com | 10:02**
Okay, so cart should be the same whether it's on mobile or desktop, so I'm going to put that one as a high priority. We already chatted about the local restrictions. As long as this is not always displaying, I'm okay with that. I would ideally like to have the restrictions available going into Friday, but we'll see where that prioritizes after we get through the rest of the stuff.

**Jivko Ivanov | 10:33**
Yeah. I'm running it on my local right now, and it's not displayed on my local. So yes, it's just not merged here.

**bethany.duffy@llsa.com | 10:40**
Okay, perfect. I already talked about hard coding the assessments. Okay, we'll move on to review here. Okay. This one, we wanted to make sure that the individual tests we're pulling from are curly and the pricing there. Let me double-check what I've got configured right now.
Okay. Vitamin D is 60, and he is 60. I'm going to change the price on this really quickly and see what happens.
Two.
Are we storing the prices and stuff locally? So, will I need to close this and turn over?

**Jivko Ivanov | 12:05**
Probably we are starting locally, but I think we are clearing it when you go back to the previous page.

**bethany.duffy@llsa.com | 12:20**
Okay, and then redo the get call.

**Jivko Ivanov | 12:23**
Yes, I think so. For the POS case, you just have to refresh.

**Speaker 6 | 12:28**
Yeah.

**bethany.duffy@llsa.com | 12:49**
Jump over... Weird. Okay, I don't think this is pulling from... For curly still.

**yoelvis.mulen@llsa.com | 13:02**
I bet you... Other... Not stop cheering.

**bethany.duffy@llsa.com | 13:06**
Sorry. Here we go. So now I got a whole different list maybe.

**lance.fallon@llsa.com | 13:18**
Yeah.

**Jivko Ivanov | 13:19**
Membership selected, yes. So the list is different because the membership is not selected right now here.

**bethany.duffy@llsa.com | 13:27**
Got it, perfect, but I don't believe it's pulling from Mark Early. I just changed the price and saved that.

**lance.fallon@llsa.com | 13:39**
Don't we have a cache set up in the gray?

**bethany.duffy@llsa.com | 13:43**
I closed it and restarted it. How long does the cache last? Does it last outside of the session?

**lance.fallon@llsa.com | 13:50**
That's not related to the session. I do not know how that is set up. It would not be tied to this session.

**Jivko Ivanov | 14:03**
No, yeah, trying to think about the cache to have it there. Okay, let me check on that then. Yeah, we're pulling from the... All this description and everything. 300000 milliseconds, 5 minutes.

**bethany.duffy@llsa.com | 14:22**
Okay, is that so? I'll double-check that in 5 minutes and see if the price changes, and then that will give me the answer I need from there.

**Jivko Ivanov | 14:32**
Or more. Let's see. Maybe not. Like. You I minute.

**bethany.duffy@llsa.com | 14:59**
This is interesting. That might just be something we need to talk about, so we shouldn't be changing technically. They haven't changed their appointment. They're just going back to view it. But in this flow, we're assuming they changed the appointment before they've actually done that.
So there's nothing in their car anymore. But let's say I reserve. I go to packages, and I'm like, "Hang on one second. I want to relook at the map." But I didn't actually select a new appointment.
Me again. Okay, so I select an appointment, I click Reserve, and it's here. Now I click Modify. So if I put something in the cart...

**greg.christie@llsa.com | 16:00**
Yeah, and I go, "I can modify."

**bethany.duffy@llsa.com | 16:02**
Now I go back and modify. I haven't actually intentionally changed my appointment, but by clicking modify, I deleted it.

**greg.christie@llsa.com | 16:14**
Yeah, wait, but that is the same appointment you selected, right? It just deselected your package from your appointment, is that what you're saying?

**bethany.duffy@llsa.com | 16:21**
Right. It is pre-selected, but it's not really showing.

**greg.christie@llsa.com | 16:27**
So that's right. Yeah, that's not the right behavior, should it not? It shouldn't go modifying by default change your order because you haven't actually selected to change anything yet.

**Speaker 6 | 16:41**
Yeah, I know. We specifically put that in the criteria somewhere that the "Modify" button does not...

**bethany.duffy@llsa.com | 16:51**
Do everything okay, so that was just okay, that was a miss that's a...

**Speaker 6 | 16:57**
That's a defect.

**bethany.duffy@llsa.com | 16:59**
Okay.

**yoelvis.mulen@llsa.com | 16:59**
So "Modify" pretty much... The agreement was, "I agree with this case," but if you select a different location or different time...

**bethany.duffy@llsa.com | 17:12**
Change anything.

**greg.christie@llsa.com | 17:13**
Now at that point, you're right. At that point, it actually should because then you've actually changed, but just by hitting "Modify," you haven't done it yet.

**yoelvis.mulen@llsa.com | 17:22**
Yeah, so this is something we have ready fixed. The "Modify" button brings the user back to this screen and sees everything the same way it was before. But we didn't fix that other case that you are showing now.
So it's something we need to address.

**lance.fallon@llsa.com | 17:42**
Okay.

**bethany.duffy@llsa.com | 17:47**
Should this still say I'm good with this here, right? It's pre selecting the appointment. This is what I already have. I don't know if we should continue that this should say reserve though, or if it should be something else or like return to packages.
That's a lot of words, but.
I'll pull that out as a design question.
Okay. So that should not pull packages out. We talked about pricing. Let' continue here.

**yoelvis.mulen@llsa.com | 18:44**
We are resetting if you select something here and then go back to packages.

**bethany.duffy@llsa.com | 18:51**
Yes, that's correct. Yeah. So if I add osteo here and then go back to packages, it's going to remove the osteo, and that is the expected behavior.

**yoelvis.mulen@llsa.com | 19:05**
So you expect that here. But not if we go... If we go back to appointment.

**bethany.duffy@llsa.com | 19:13**
It should only clear the car if you're changing the package. If you make changes to the packages, then you remove the add-ons. It should not be doing that unless you've changed. That was the requirement.
If it is removing them no matter what, then that's a defect.

**yoelvis.mulen@llsa.com | 19:31**
So I think right now it's removing no matter what.

**bethany.duffy@llsa.com | 19:37**
I'll drive that down. I can't really because it's not here. Let me get out of here and go to review, let me add cornisol, go back to packages. Yeah, it's removing it. That's not the correct behavior.

**Jivko Ivanov | 20:07**
Which one is not to create the behavior?

**bethany.duffy@llsa.com | 20:10**
So if I go over here and add an add-on, and then I'm like, "You know what? I actually know I want to change my package. I should... When I get back here, the add-on shouldn't be removed unless I make a change on this page.

**Jivko Ivanov | 20:28**
What we talked about was that if we go back in time, it's like you're reversing what you've done. That's like resetting.

**bethany.duffy@llsa.com | 20:36**
No, in the initial... We talked about the different states of the button and that fell out on the design. But that was to preserve to only do the auto-remove if changes were made. If no changes are made, then the state should be preserved.

**Jivko Ivanov | 20:53**
Okay, again, I'm happy to update here. But yeah, what I understood and implemented was that if you go back in time, that's like you're resetting something like you go back in time. Yeah,

**yoelvis.mulen@llsa.com | 21:06**
Yeah, I understood the I but I think what bet is saying makes sense. But our idea what for MPP we wanted just to clear everything up when you get when the user gets back in time.

**bethany.duffy@llsa.com | 21:21**
When I wasn't back in time, no, it was in time.

**yoelvis.mulen@llsa.com | 21:24**
No, I mean back to the previous steps.

**bethany.duffy@llsa.com | 21:27**
Yeah, I understand the scope that you guys implemented. It was just a misunderstanding. It was not going back into the step to make the change or force the removal. It's making a change to force the removal.

**Jivko Ivanov | 21:45**
Not a problem. We'll update accordingly. Be just quickly. I just double-checked the code at least to my local end. Yes, we are pulling the package we are from. Okay, that's good, but those are the diagnostics. We're pulling the packages as well from Rinor. Could you please tell me which one of them is not the same?

**bethany.duffy@llsa.com | 22:12**
No, none of these prices are correct.

**Jivko Ivanov | 22:16**
You're talking about the prices. Okay, I think we're doing that the price as well, but okay, I'll double-check on the price.

**bethany.duffy@llsa.com | 22:22**
The description seems to be correct.

**Jivko Ivanov | 22:26**
Yeah. I check the names and discussions I do to.

**lance.fallon@llsa.com | 22:29**
Place the dollar amounts. Looks like the data is there. Unless it's all hard-coded, but like the plus $01:11 plus twelve, plus zero. That's got to be hard to use. Somewhere...

**Wesley Donaldson | 22:50**
We had a MARC that was in the side of the inside of the React code that was explicitly setting a mark inside a code outside of like if you're in a local environment versus if you're on the sandbox environment that was supposed to be removed like early last week.
Like we had that feedback on Monday of last week. Is that still there? Because. That could be. Why. It's.

**Jivko Ivanov | 23:15**
No, the mock is removed.

**Wesley Donaldson | 23:16**
Okay.

**Jivko Ivanov | 23:16**
There was the testing mark that's removed. I'm checking the prices right now as well, but it's the price, not the description or the name that you're asking about, right?

**bethany.duffy@llsa.com | 23:29**
Beth, correct. Yeah, the price is not correct.

**Jivko Ivanov | 23:32**
Okay, I'll check on that as well.

**lance.fallon@llsa.com | 23:34**
Thank you. So that should say plus whatever the package costs. Then in that little great text...

**bethany.duffy@llsa.com | 23:40**
That's the great text actually got removed from the design, but I think that might have been... I think this was generated from an older Figma. So this piece can actually be removed.

**lance.fallon@llsa.com | 24:01**
Plus is literally just what it costs.

**Jivko Ivanov | 24:04**
Yeah, so I see the prices coming through the graph. We are definitely pulling the data.

**bethany.duffy@llsa.com | 24:15**
Because this is $02:97, this is $1908, and this is $99.

**Jivko Ivanov | 24:25**
Okay, isn't that what it's saying here? This is $198.

**bethany.duffy@llsa.com | 24:33**
This is the price. That should be here.

**Jivko Ivanov | 24:37**
Okay. Okay, that's good.

**bethany.duffy@llsa.com | 24:43**
And this piece can just go away. Yeah, that she's going to be there.

**Jivko Ivanov | 24:49**
So instead of +111, it should be 2907, as you're saying with the bigger ones.

**Wesley Donaldson | 24:55**
Have it.

**bethany.duffy@llsa.com | 24:55**
Yeah.

**Jivko Ivanov | 24:56**
Okay, got it.

**bethany.duffy@llsa.com | 24:58**
And I know.

**lance.fallon@llsa.com | 25:00**
You'll still say plus care, but just replace the number with the cost of the package.

**bethany.duffy@llsa.com | 25:08**
Yeah, the copy on the Figma is plus $297 and then added to base.

**Jivko Ivanov | 25:15**
The small one shouldn't be there at all.

**bethany.duffy@llsa.com | 25:18**
Correct? Y.

**Jivko Ivanov | 25:19**
Okay, that's an easy fix, thank you.

**bethany.duffy@llsa.com | 25:23**
The other thing I had on this page is these are flipped, Gregg. I don't know if you care about that. So in the Figma, we have the lower price one on top.

**greg.christie@llsa.com | 25:34**
Yeah, I think that's how it should be. I mean, I think that's what people are... I think that's the most intuitive way.

**Jivko Ivanov | 25:41**
Okay, do you want me to sort by the pricing in ascending order?

**bethany.duffy@llsa.com | 25:47**
Yeah. Yeah, right.

**Jivko Ivanov | 25:49**
Sounds good.

**bethany.duffy@llsa.com | 25:58**
Then there are just some little design things, but these ones are hard-coded, Gregg. This math doesn't seem correct because we offer Osteo and cortisol at $60 apiece, but we're not showing them the price of cortisol.
So we can leave it as $158 for now, but we may just want to revisit what's in there.

**greg.christie@llsa.com | 26:20**
Yeah, I agree. I think it's okay for now, but I do think... I mean, shouldn't this actually be coming from... Shouldn't this be getting pulled in from MCCARLEY? Ultimately, is that possible?

**bethany.duffy@llsa.com | 26:36**
Ultimately, yes, right now that would be a lot of mapping and dynamic stuff. So for right now, we're just hard coding this information, and then once we know where the final plan is at, then we can pull this information from the plan itself.

**Wesley Donaldson | 27:18**
Do you want to test the membership is not allowed in two states, three states, Nevada and something else? Forgive me, I don't remember.

**bethany.duffy@llsa.com | 27:29**
Alabama, Nevada, and Maine.

**Wesley Donaldson | 27:31**
Yes.

**bethany.duffy@llsa.com | 27:43**
Man, Google Maps is mean to Nevada. Why is it so brown?
It's a brown state.

**Speaker 6 | 27:58**
Just like Arizona.

**bethany.duffy@llsa.com | 28:00**
I am seeing members of your in there.

**Jivko Ivanov | 28:07**
Yeah, I think that might be coming from that JSON file.

**bethany.duffy@llsa.com | 28:10**
Which is not correct right now. Okay, yeah, we know.

**Jivko Ivanov | 28:13**
It's not correct.

**yoelvis.mulen@llsa.com | 28:13**
But regarding the New York and those states, are we going to have different assessments in those states that we need to filter that hard core, at least?

**bethany.duffy@llsa.com | 28:30**
Not right now. So the only restriction right now is that in Alabama, Nevada, and Maine, we cannot offer anything except the signature package on the package page, and then in the review page, we can offer the canvas kit.

**yoelvis.mulen@llsa.com | 28:54**
So it's just removing options now. Assessments. Correct.

**Wesley Donaldson | 28:59**
[Laughter] 3.

**bethany.duffy@llsa.com | 29:03**
We may get there in the future, but right now it's much simpler.

**Wesley Donaldson | 29:12**
So the defect is in the three required states. We should be hiding the membership, but we're not showing the membership option as a package. Alabama, Nevada, and Maine still won't remember, will you?

**bethany.duffy@llsa.com | 29:28**
That's that was right. Yeah, I had... That was something that came up in the chat with Jira. So I was going to create a task for that because it's an issue with what's in the config file.
It's not an issue. The code itself, at least from what I understand right now, the config file just has dummy data in there, and it's looking for New Jersey and Rhode Island, which are not accurate.
Okay, we are at times. So I want to jump to this last page. Okay. Cool. That's updated now the...
I'm just putting stuff in here to make sure it's doing all the stuff we need it to do, okay? It's not even letting me put letters in there, so that's good.
Greg, did you see anything concerning that? I didn't call it out.

**greg.christie@llsa.com | 31:12**
No.

**bethany.duffy@llsa.com | 31:13**
Okay. So I will get...

**yoelvis.mulen@llsa.com | 31:25**
Okay, I don't know why the record is allowing you to add those three extra numbers, but...

**bethany.duffy@llsa.com | 31:31**
Yeah.

**yoelvis.mulen@llsa.com | 31:32**
You can remove them as you want to succeed.

**bethany.duffy@llsa.com | 31:37**
I removed one too many. There we go.

**yoelvis.mulen@llsa.com | 31:39**
Maybe there are some cars with, like, 19 numbers. I don't know.
Should we're gonna change this. We have a ticket to allow the user to input, date, but we wanted to make it got it.

**bethany.duffy@llsa.com | 32:08**
Okay, you guys already called that up, then we're good.

**Wesley Donaldson | 32:12**
So hold on, we're not planning on making that for MVP, do you? You obviously that's a future refinement post MVP refinement.

**bethany.duffy@llsa.com | 32:23**
Not for Friday. Yeah, we don't need that for Friday. I would just like to update it before we go to production.

**yoelvis.mulen@llsa.com | 32:43**
We have a PO request from the army that is wiring the email and the rest of the information to this page, so that should be ready today. Okay.

**Wesley Donaldson | 32:57**
We're probably not going to get the at the calendar.

**bethany.duffy@llsa.com | 32:57**
Cool.

**Wesley Donaldson | 33:00**
LAS he mentioned he was still working on that and run to a little bit of refinement issues around the edges. So I asked him like, hey, take the product offer of de prioritizing that so you can actually get the confirmation page hydrated properly.

**bethany.duffy@llsa.com | 33:15**
Okay. Got it. Yeah, that's not needed by Friday. I identified the couple of things that we'll need by Friday, so I'll make sure I'll just pay us and see if we already have things for them. If we don't, then we can get them created wherever you need them.
I think you're using a different epic to track. So, okay, awesome.

**Wesley Donaldson | 33:33**
Yeah, kind of dark, but six six is the epic. I didn't... That just purely happened. I'll send you the list from this meeting that I have. I suspect your list is probably better than mine, but I'll just
send you over what I have and we can add it.

**bethany.duffy@llsa.com | 33:49**
Then, while I am out, I'm still seeing a lot of discrepancies between the design that's implemented and what's on Figma. So if there's someone who needs work, they should be going through page by page on Figma and comparing to what has been implemented.
If there's a question on... Well, maybe the Figma wasn't updated, then Greg can help answer that. But I'm seeing things like I said, the button width and the drop shadows aren't there. I think some of the tech sizing is still off. All of that kind of stuff needs to be buttoned up.
I don't necessarily think that I need to go through and point all of that stuff out. I think we should have someone who can go through and do that on the team.

**Speaker 6 | 34:36**
I'm worried about that because we have a lot of things that have been said like, "Well, that needs to be updated in the Figma. And we've only told certain people so there's no clear source of truth.

**bethany.duffy@llsa.com | 34:51**
I think as far as the TED sizing and all of that, that's very clear. The things that may not be, are like the order summary and making sure that that's in the right spot. I'm not in the right one either, though.

**Speaker 6 | 35:13**
Can we clearly label the things that we don't have to change because otherwise, it's not clear. Just you listing things right here because it's hard to follow that in a day or so.

**bethany.duffy@llsa.com | 35:33**
I guess I would lean more towards... I don't think I'm in the right one. I'm not seeing the ones that say "Use this one." I think we can do a quick review of the design and see if there's anything that we didn't update. I would be more confident in Figma being accurate than the sandbox environment at this point.
It's just small things. I think the foots missy, what I would want to do is...

**Speaker 6 | 36:24**
We can have someone go through and create a list or tickets and then Greg, have you confirmed the things on that list?

**bethany.duffy@llsa.com | 36:34**
Yeah, that were...

**greg.christie@llsa.com | 36:35**
Yes.

**bethany.duffy@llsa.com | 36:36**
Yeah, that's exactly perfect. Okay, cool. We'll get those finalized by the end of the day. West, I'll make sure I can carve out time for you if you need it, but otherwise those are the main concerns before the end of the week.

**Wesley Donaldson | 36:55**
Nice. Yeah, I think I don't have... I wasn't part of the conversation with Jeffco Co. As long as Jeffco Co is clear on that, I'm comfortable with that. I'll send you the list and it doesn't have to be super detailed, but I'll try to capture everything from this meeting.
The ones that I'm the most concerned about are the ones you actually already connected with co on.

**bethany.duffy@llsa.com | 37:14**
Got it? Okay, yeah, I had it. I had to take away to create two of those stories for the diagnostics and the...

**Wesley Donaldson | 37:21**
Perfect.

**bethany.duffy@llsa.com | 37:22**
The state filtering.

**Wesley Donaldson | 37:24**
I'd like to propose us doing another... I know we love these, but just another walk-through of the Paul milestone moment where... Greg, you can actually walk through everything and see... I guess I'll open the floor. Jeff, Lance, do we think that is the end of the day tomorrow? Is that midday Wednesday? I'd like to leave at least one day for Greg to get us feedback.
There's always going to be something.

**Jivko Ivanov | 37:55**
Midday Wednesday. That could be like whenever something is in death, I could just ask to review it or something like that too, I guess.

**Wesley Donaldson | 38:04**
I agree one hundred percent. You're absolutely right. I think my counter to that would be having a commitment to when everything is in versus just piecemealing it in. Piecemeal will get to the individual plus immediate feedback.
But I want him to be comfortable before he has to go into demo that everything is in.

**bethany.duffy@llsa.com | 38:23**
I know you said you were traveling at some point. Will you be available for the Wednesday office hours at noon?

**greg.christie@llsa.com | 38:31**
I will not be. I'm going to be flying, so I think Thursday would be the best. I'm going to be free all day and ready to... I know it's cutting it close.

**bethany.duffy@llsa.com | 38:42**
Okay, yeah, I'll leave that up to you. Then there can be some offline review in between as well.

**Wesley Donaldson | 38:51**
So I think just Jeff's answer is the right one. Then let's use the product session, let's do one-offs, which we're targeting you directly, Greg. I probably assign tickets to you once they're ready then.
Just ask you to take a look at them.

**greg.christie@llsa.com | 39:06**
Yep, that's perfect.

**Wesley Donaldson | 39:07**
He...

**bethany.duffy@llsa.com | 39:10**
Okay, cool. As I always have, any questions pop up, just let me know.

**Wesley Donaldson | 39:15**
Sounds.

**bethany.duffy@llsa.com | 39:17**
Thanks, everyone.

**Jivko Ivanov | 39:18**
Thank you, team.

**Wesley Donaldson | 39:19**
Thanks, all.

