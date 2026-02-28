# Mandalore DSU - Feb, 26

# Transcript
**Wesley Donaldson | 00:11**
Finding a cold for shore? 
Good morning, all.

**Speaker 2 | 00:24**
Hello. Morning.

**Wesley Donaldson | 00:35**
Only have seven folks. Let's give it one more minute, see who else can get to join. Francis and Harry. We can do you guys first, and then we can all Beth joins, for example. Francis, for you, there's really one thing that we have under the board for you. This we kind of in speaking to Daniel, he just didn't have bandwidth early in February. Wondering if we can kind of get to a resolution on this. 
If you can take a look at this task and just see what the hold up, what the challenges are.

**Speaker 2 | 01:12**
Okay, let me. Yeah, let me get together with DI, you know.

**Wesley Donaldson | 01:16**
Sounds good.

**Speaker 3 | 01:16**
Go over this things.

**Wesley Donaldson | 01:18**
Just to close the loop on that. Team members, you should and me how you can speak to this. You should be enabling your release notes if you're on team Mandalore. That was our agreement some two weeks ago. 
So if we haven't already do that, done that, we don't need to solve it here, but just maybe messaging the channel and me how it can walk us through how to enable that using our local environmental variable.

**Michal Kawka | 01:43**
Yes, it's actually one Slack in a local do and V file. It's all summarized in the rea, so feel free to take a look at the shred package. Release notes or something like that. You'll definitely find it. 
And everything's. Described in the region is just a matter of one flag, so it's bit as hard.

**Wesley Donaldson | 02:01**
Cool. Harry, we don't have active or critical path on you for the board. We already spoke about the refactoring. Same conversation with Dane's task. So I think we need to go into those. One thing I will ask Antony, if you want to share your status around the cleanup activity.

**Antônio Falcão Jr | 02:23**
Yeah, sure. Hey, Tim, I didn't run this reconciliation work, so we have these two tickets. One is Ready for Broad's basically the work on design or building this or define this strategy on how to run it. We can move that for DA for sure. 
And the second one in review is related to the actual work per se. So running this, I did that, yesterday night after hours just to make sure that the extra load did not affect in any way our users. So it went pretty well. We was able to reconciliate all the data so it we can move this one or done.

**Wesley Donaldson | 03:14**
Okay, can I ask you just to comment in kind of the report, the summary that you shared with me and then we can move it?

**Antônio Falcão Jr | 03:21**
That makes sense. Yeah, absolutely, I'll do that and move this Backgon yeah, and sorry, go ahead and I just put this thirty one, to review.

**Wesley Donaldson | 03:25**
Cool. No, go ahead not.

**Antônio Falcão Jr | 03:36**
It basically is the second one in the review. 
Yeah. Is basically to make our scheme message scheme a bit more flexible and avoid some contract. As so we did make all the fields optional, and we are establishing that as a standard for new feuds. And so, I will put the DPR on the channel for you guys.

**Wesley Donaldson | 04:11**
Perfect.

**Antônio Falcão Jr | 04:12**
Appreciate that. For me? 
Please.

**Wesley Donaldson | 04:14**
Yeah, I would assume maybe Dane is the best person to give you a review on that. Dane or Harry. For this one, I'm just gonna.

**Antônio Falcão Jr | 04:20**
Makes sense. Yes.

**Wesley Donaldson | 04:21**
And done. Once you attach the notes to the actual resolution, feel free to drag that over to complete or set status to complete for that. Well. Let's go in order. Devin. Do you want to sketch up where you are.

**Speaker 6 | 04:41**
So I've been looking at these QA validations since earlier this week, and since we spoke yesterday about how the acceptance criteria has kind of changed and morphed a little bit. I haven't been, I kind of changed the plan. 
Like, I'm not going item for item, but I'm gonna, open up defects as necessary. But for this one, it's looking good. I just haven't been able to validate the error messages. I'm not sure if there's a way to trigger that to the bottom.

**Wesley Donaldson | 05:19**
Which error messages are the one pertaining to choosing an appointment time?

**Speaker 6 | 05:26**
Like the loaderor.

**Wesley Donaldson | 05:29**
Okay, I think my suggestion there is like, you need to payer with an engineer to trigger those conditions.

**Speaker 6 | 05:36**
No.

**Wesley Donaldson | 05:37**
And there are obviously data requirements that can trigger those conditions. I think I would ask you to maybe sync with Jennifer. She has a document on confidence. Don't remember at the top of my head, but I think I have a link that could give you some of that information. Either way, like, let's not. Let's not let's unblock ourselves on this one by just add a pull. Beth to help with. 
Like, here. This real world situation can get you what you need. Or let's say if we have a test document, we have that information in the document that Jennifer owns.

**Speaker 6 | 06:06**
Okay, I'll follow up with.

**Wesley Donaldson | 06:08**
Yeah. And at this point, I'd rather close this out and add in to that midway checkpoint. EP The one specific task or que or validation you need to do. 
So if 50% or 90% of this is done and you're stuck on one or two of these, let's close this and move those over to there. Cool.

**Speaker 2 | 06:28**
Down Photph.

**Wesley Donaldson | 06:30**
Cool. And as we talked about yesterday, like the goal here is like Beth and myself and Jennifer volunteered to kind of do a little bit of review once the feature, once the page has been completed. 
So feel free to like, hey, I'm taking a first pass. I want someone else to look at it. Perfectly fine. All right, Jeremy, over to you.

**Speaker 7 | 06:53**
I just merged that actually, so if you have a suggestion for what to pick up, that would be appreciated. I want to point out that I have to comment about the calendar component. Yesterday we talked about possibly using one, but based on what I was trying to do, it just wouldn't really work. 
So that's why that comments there. Explains what I found. If the adding the appointment to the calendar is important, we could make another ticket and have me research that better. But I figured for now it wasn't really a priority, so I just need to know what direction to go.

**Wesley Donaldson | 07:25**
And it's not really a priority. Stace had made a recommendation on a MPM package that we can leverage so ice assign that over to you. Take a look at that. But per products direction, if we need to push this to post demo, that's a decision we can make based on level of effort. 
So it sounds like level of effort is high. Take a look at this ticket. If it's still high, just let us know.

**Speaker 7 | 07:49**
Alright. Yeah. I'll. Yeah. I'll putli stuff there, then I'll pick that up.

**Speaker 3 | 08:01**
The morning team. So I've been focused on the review page at this time. All of the items have been implemented. The PR is up. I do have a few clarification questions to Beth I posted. I think most of them are all of them in the chat and they spur her advice. We can sync up after this stand up. 
And once I received these clarifications. I can make the updates if as necessary. No impaiments at this time, thank you.

**Wesley Donaldson | 08:32**
Okay. You said you had a PR or any. Or is that just on 5708? Or can I pull another one over to review?

**Speaker 3 | 08:40**
Everything right down here is in the PR but again, I'm not asking for review this time, because I would like first to go over with Beth, if further changes on this.

**Wesley Donaldson | 08:49**
Got no worries.

**Speaker 3 | 08:54**
Thank you.

**Wesley Donaldson | 08:55**
Let's keep going. LA.

**Sam Hatoum | 09:05**
Yeah. There's a document that I attached with either my answers to the questions or kind of indications.

**Speaker 2 | 09:18**
That we need.

**Sam Hatoum | 09:20**
Some more clarification on the call today.

**Wesley Donaldson | 09:26**
Perfect. I think my only ask to you would be we're not going to be able to go over this on the call. I think your plan of attack, your implementation summary is kind of spot on. 
So I would just say like maybe distill this down to like a simple list of questions and then your higher implementation plan for the sake of the call. But I don't need to micromanage that. Just try to make it a little bit more consumable with my direction here for the call.

**Speaker 9 | 09:52**
You mean for the call with Ricurly, right?

**Wesley Donaldson | 09:55**
Yes, one concern I have on this epic and you're all us if you could speak to this we have you currently have the this ticket for doing the actual implementation. 
It is flagged as a. The spike is flag as a dependency for that ticket. I know, Lance, you've already kind of created a rough pass which all of us has integrated, I think. My question maybe the three of us compare the two of you guys compare and just clarifying what is available now versus what can be available based on the conversations that happened today. Our goal here is to get this ideally implemented for mid next week. Just there's a little bit of uncertainty of what's enough that we currently have that can allow us to create an order based on the rough POC that Lance has done. 
And then, as well as what we need, what will be gained from the spike that informs the implementation? That's not clear to me yet.

**Speaker 2 | 10:53**
Yeah, maybe we can follow up after the meeting. Lens. Because I have already have the checkout page, it should be ready to complete the checkout. I just need to make sure that everything is fine with the button. 
And maybe you can Bran, use my branch. I'm gonna commit the changes to finish the implementation for the Butgon if there is something pending.

**Speaker 9 | 11:27**
I have a question, Lance, based on what you guys have done, I've seen a bunch of testing.

**Wesley Donaldson | 11:30**
Please.

**Speaker 9 | 11:38**
So do we have like an example flow that we can showcurrly on how we inserted things into their platform for the call?

**Sam Hatoum | 11:51**
We can either do it live or we can show them some accounts that we that I created previously.

**Speaker 9 | 11:58**
Okay, I would say we probably have time for both. So I would probably start with a lag one and then see if they have any feedback and then we can dive into previous ones if they have questions there. 
So if we have that in place, then I'm feeling pretty good about going into the call.

**Wesley Donaldson | 12:12**
Yes.

**Speaker 2 | 12:13**
We'll say if everything goes well, we should be able to see that working today. I just need to sync up with Lens to make sure I am doing everything fine and that we are talking those other concerns about the retry or the failures and things like that.

**Wesley Donaldson | 12:36**
Okay, that's a great segue. You. Us. For you to go next. A few things on your plate.

**Speaker 2 | 12:44**
Yeah, I did the implementation for the Y I've been working on some refactoring to make everything work fine and looked fine, but it's working pretty much good. 
Well in the. The validations are working fine and I am integrating with the backing. I did some tweaks to the backon to make sure that we are requiring the token, but I am getting the token and the error messages everything for from recording, and that's working very nice with the quali I frame. Other than that, just I think the major thing that is spending is just testing and making sure that we are doing everything fine, especially on the Butgon.

**Wesley Donaldson | 13:33**
Okay, perfect. So, yeah, obviously that meeting today is important. You're pairing with Lance is important. Maybe let's circle back around. Or if you guys can just share me the output for that and I'll reflect that status in the board. Let's try to see if we can get to that before end of day. Today is not. I feel like we're in a really good place. I just want to make sure that we're reflecting that and we're getting you any addressing any uncertainties you may have. 
Okay, we're almost at time. I have bandwidth to go over. It's going to confirm. If anyone else has to. Needs to go first. Because they cannot go over the 1115.

**Speaker 9 | 14:16**
The only heads up I want to give. Jeremy, I know you've got some bandwidth today. We're going to have a shop if I break fix coming. They had another outage yesterday on our custom blocks and we have to do that insert again where we inserted date of birth and gender. 
So the customer service or support team is giving us that spreadsheet. I just don't have it yet. So that will be coming at some point today.

**Wesley Donaldson | 14:42**
Do we want to? I think we still have time. Beth. Like on the calendar. I know your direction was if lo is high, but it sounds like we still have. Even with that fit break fix you need to do, we would still have tomorrow and Monday, maybe even Tuesday, unless Jeremy gets something else that's more critical. 
So I'd like to see if we can get that calendar functionality.

**Speaker 9 | 15:01**
Yeah, yep, I'm going to that.

**Wesley Donaldson | 15:03**
Cool. All right, let's keep going over. Se 15 me? How to you?

**Speaker 9 | 15:11**
He everyone.

**Michal Kawka | 15:12**
So I wrapped up the Playwright test for product display. I addressed the validation gaps that were discovered yesterday. That's basically a ticket MDL 64 zero. It's already in re review. I have one question to the end to end tests though. 
So I noticed that all end to end tests for the e commerce shop use mox. So we basically intercept the GRAPHQL API response and we validate against the mocks. Is that what we want to do? Because it's not a fully end and puff, so we might miss some backend errors. 
If we go ahead with this approach, I'm wondering if I should replace the MOCS with the real request to the re record the soundbox. Or do we want to keep using MOXS? Because that's something that pretty surprised me for a playwright test.

**Wesley Donaldson | 16:08**
I can ask that for like s sorry, like six?

**Antônio Falcão Jr | 16:09**
What environment.

**Speaker 2 | 16:11**
What environment?

**Speaker 10 | 16:15**
I was just curious what environment does run on. Is that like a the test on builders? Is that a test on a deployed test environment?

**Michal Kawka | 16:23**
I think in general it's running against, you know, a mock. I would need to double check which environment it run it runs against, but I'm 100% sure that we intercept the graphical AK response and we basically returned the mock. 
So I was thinking we should hit the recorded soundbox on our PR environments and on the dev environment. And later, of course, in Prague when we have the full recorded conflict, we should hit the relap, I believe.

**Speaker 2 | 16:51**
Yeah.

**Michal Kawka | 16:52**
I would agree that's the approach.

**Wesley Donaldson | 16:54**
Yeah, exactly.

**Speaker 10 | 16:55**
I would definitely agree with that. The only place I would say to use the MOX would be when you're testing locally.

**Speaker 2 | 17:04**
I think based on the conversation that we had, we decided that the best idea was to mock everything for most of the tests and create a few small tests that are going to be end to end.

**Wesley Donaldson | 17:14**
No. CO.

**Speaker 2 | 17:21**
But I am okay with having everything went to end. 
But you know, we may be overusing the PRs or something like that.

**Wesley Donaldson | 17:33**
Okay, let's maybe table this. I feel this is bigger. It's a conversation of how we want to approach end to end, how we're going to integration as well as how to do local testing. 
So me how? Maybe table this for now. But if you can just put a start a conversation inside of Mandalore and we'll circle around there.

**Speaker 2 | 17:51**
Thing.

**Michal Kawka | 17:51**
For now, I follow the approach that we have. So I created Mox. But I'm happy to adjust all the tests later on to use the relapi.

**Wesley Donaldson | 18:01**
Sounds good.

**Speaker 2 | 18:02**
The a bundage with themox is like it's very reliable and it's super fast. And you know the advantage of the using. The real thing is that we are catching real backend as and GRAPHQL mismatches. So I think a combination of both could be a sweet spot.

**Michal Kawka | 18:19**
But yeah.

**Wesley Donaldson | 18:21**
Okay, yeah, let's have the conversation chat. I think my perspective is maybe lower environment local would get MOX and then anything greater than local should get live data. 
I think we're clear on all these. I think my concern with the amount of playwrights we had. Have you had a chance to. Yesterday? We had agreed that we're going to think between you and Stefan just to have, like, a shared perspective on how we want to tackle playwrights generally. Did that meeting happen?

**Michal Kawka | 18:51**
And no, not yet.

**Wesley Donaldson | 18:53**
Okay. Can I ask both of you to please prioritize that after this call? I just. I don't want this effort to have to go back and make updates on it. Cool. Great transition to step.

**Speaker 11 | 19:10**
Hey Tim, so quick update 05:50, it's done. Thank you for preview, Nicole. 05:57 is in progress. I think I'm making good progress. That are created and they seem to be passing. So just need to double check everything and maybe open up for preview and then pick up the 558. I'm not doing too well today, so I might take the rest of the day off depending how I feel better, but that's my update.

**Wesley Donaldson | 19:47**
Yeah, I never ask a person to work while they're not doing well. I think maybe if you can just maybe have the conversation with me how and then if you need to take the time. 
But. That's not my call. But I think if just the peer session, if you could make that work would be valuable.

**Speaker 11 | 20:04**
Okay, it na is available after the call. We can talk.

**Speaker 12 | 20:08**
Yeah.

**Wesley Donaldson | 20:09**
Cool. Lance, you went. I think that's everyone. I'll maybe leave the floor to you, Elvis, just to speak to your perspective and your perspective of where we are at a higher level overall. 
Sorry, Nicholas, i apologize. I skipped you. Nicholas. You want to go first? Then we'll give the floor to you as.

**Speaker 12 | 20:35**
It's all right. Yeah, both of my appointment stories are ready for review. I talked with Greg last night. We are keeping the current behavior, which is search results fall back instead of limiting by the filters. 
And the two. There's three no results found components in the Figma design. And I believe we're only going to use one. So that's the change for that.

**Wesley Donaldson | 21:17**
Co. Thank you, sir. Who's doing a review appointments, I think? Well, you're the owner of that, I guess messaging the channel, whoever has bandwidth can help you with the review. 
And then as I said, cool.

**Speaker 7 | 21:31**
I can review it since I'm kind of low on stuff and I'm waiting on that. Tick it from Beth.

**Speaker 2 | 21:37**
Cool.

**Wesley Donaldson | 21:38**
Alright, you all this. I know you kind of shared a little bit of this before, but if you want to just give your restate, your perspective of where we are as a whole.

**Speaker 2 | 21:52**
So do you. Do you mean like the current state of the system?

**Wesley Donaldson | 21:57**
Y yes. So like, you've kind of taken on much of checkout. It sounds like if I'm just summarizing what you said, it sounds like you're making good progress in validation. That sounds like that's in. You've tried to do an a first pass implementation on connecting to recurly directly via what lasts provided you're going to pair with Lance around the spike and see what additional information is needed there, as well as what we're bringing to recurly. This afternoon, anything else along those lines?

**Speaker 2 | 22:28**
No. I noticed that, the individual diagnostic are all I are now coming from the API, so that's great. I can use that. That was something I was missing to complete the checkout. I think there are a few missing pieces in the workflow, but I guess we already have ticket for those. 
But you can do a check. Let me just share it to one.

**Wesley Donaldson | 22:55**
Well, so I think that's what I'm concerned about. What are those missing things in the workflow? I'm sorry, not workflow in the checkout flow, so we don't have to do it right now, but maybe you, myself and Beth or you and Beth or just does concern me. We just need to account for that if we feel something is missing. 
So let's just get in front of that as soon as we can.

**Speaker 2 | 23:22**
So are you acting just for the checkout part?

**Wesley Donaldson | 23:27**
So you mentioned just now that you feel that there's missing steps or functionality.

**Speaker 2 | 23:32**
Yeah, but it's like the overall, system not the shake out the Chicago is okay for me. I think I one thing that there are a few details here and there that are probably missing. Let me share here. 
Okay. In the packages, for example, the. We need to put the text. Replace this by text.

**Speaker 9 | 23:58**
That was supposed to be hard coded for this first round in the ticket.

**Speaker 2 | 24:02**
Yeah, so we need to replace this by the hard core text, right? But just we don't want to display this thing. I guess.

**Wesley Donaldson | 24:13**
So we have this dynamic coming from the custom fields already. I guess my question would be it's probably easier just to read the correct value if that's already coming over from recurring.

**Speaker 9 | 24:24**
It is not. And that's why the decision within the requirements inside of the ticket was to hard code the text for now.

**Wesley Donaldson | 24:25**
Not okay.

**Speaker 2 | 24:32**
Yeah, that's what we need to do. We need to hardcode the text. If that. Is that what we want? I think it's good enough, but we need to do that. It's not done yet.

**Wesley Donaldson | 24:41**
No, so hold on, let's be clear on who owns that. 
I'll write up a ticket for it added to the mid checkpoint epic but ji code that would fall to you as the owner of product of package selection.

**Speaker 3 | 24:58**
No, because I own the next page, not package selection, the review page.

**Wesley Donaldson | 25:01**
Sorry, my apologies. You own. Actually, I'llno that you have two, four children.

**Speaker 2 | 25:08**
Yeah. I think we enter an agreement that Disco is gonna own packages and review. Because those two things are very related.

**Wesley Donaldson | 25:16**
Good. Yeah.

**Speaker 3 | 25:18**
That's new to me, but it's okay, I guess, because I haven't really worked on packages. Guys, that's okay.

**Wesley Donaldson | 25:29**
I'll get the ticket in the board. I think the miss business requirement is clear, and then we'll as a team, we'll figure out who's available. Jeremy has some bandwidth. It is related toffcode to some of the stuff you're doing. 
But let's see who is the best person to. To pick it up?

**Michal Kawka | 25:43**
Yeah.

**Speaker 9 | 25:44**
And for that one, I just want to reiterate. It should be matching what's in the Figma and not what's getting pulled from recuurly.

**Speaker 2 | 25:55**
Yeah, it's just like a mapping that we need to implement to convert those codes into actual text.

**Speaker 9 | 26:03**
Well, what I'm saying is that what we have in recuurly may not match because what's in recurly is just for the ded duplication requirement. It may not match the text that they wanted on the screen. So, for example, we're showing ten assessments under a complete preventative care suite. I don't know that it's ten, I think on the Figma or. 
Well, yeah, that one was 10, but for the one after that, I think it was 15. And I'm not seeing that on this page, so you won't get back 15 diagnostics for that. So don't use the diagnostic list that's inside or recurrly for rendering that dropdown.

**Speaker 2 | 26:41**
Yeah, now I see those probably are hardcoded because I the same here and here. Yeah, we need to figure okay, but here it is different am okay, we need to figure out but yeah, the approach is just to copy the thing that we have in FEMA, right? Just forget about the codes for now. Correct. 
All right. And then we need to modify, functionality. I think it' nick working on this one.

**Wesley Donaldson | 27:16**
Yes, and he has a nick. You had a. You said you had a review PR review for that.

**Speaker 12 | 27:23**
Yeah, well, I was looking away what was the I was working on what.

**Speaker 2 | 27:29**
And modify button.

**Speaker 12 | 27:32**
It's yes, it's in the PRY.

**Speaker 2 | 27:34**
And if you click appointments like similar behavior.

**Michal Kawka | 27:38**
Yes.

**Speaker 2 | 27:40**
That's great. Than that let me see thing. I know that this is minor but it's bothering me is those buttons are the is are rounded here are more like square. Need to do something about that, but yeah, okay. 
And other than that, is the membership working? Because I see this zero here and I was expecting to see like thirty dollars or something like that.

**Speaker 3 | 28:12**
I can show it on my branch.

**Speaker 2 | 28:19**
Is this working in your branch for you? What you mean?

**Speaker 3 | 28:22**
Yes, but I do have a question. Where I get that value from right now, it's hard to hold it to 30 dollars. But I should get somewhere dynamically.

**Speaker 9 | 28:33**
We didn't get to that yet. So the requirements weren't written for that. We pulled the discount out for membership. For right now, it should just be saying first year freeever, they add a membership because we still need to figure out exactly where we're pulling the discount from and what that logic looks like.

**Speaker 3 | 28:54**
Okay, so on that line where it says one life annual membership, it should say on the right, first year free.

**Speaker 9 | 29:01**
Right? Yeah, that was updated in one of the tickets. I just don't know which one we updated. That is, I think because it changed hands, it probably got missed. Yeah.

**Speaker 3 | 29:13**
That could be. And it's not in the Designs either.

**Speaker 9 | 29:16**
No, it had to be because we pulled it out. The Final design is the discount, but for now, we're skipping that.

**Speaker 3 | 29:27**
Okay? Yes, here it says minus 30. So that's what I used ASPORT of Designs. But yes, I will add the first year for you. The other question here is if you move to the right place, further to the right. Even further, please. 
Yeah. So look here, this buttons. Yes, and move keep upgrade, in the middle screen and then you'll go from 15 screenings back to five. Where do we get these numbers from as well?

**Speaker 9 | 30:08**
Yeah, I wanted to talk about that. So given what we just talked about, I would say let's hardcode this. So for the page that we were just talking about where it says includes 15 screenings, we need to match that.

**Speaker 3 | 30:23**
You want me for now to have call it exactly as it is on this design.

**Speaker 9 | 30:28**
Yes, but the number will change depending on which one they're removing. So right now they're removing men's and women's health screening. And it has 15 screenings in it. If they remove the chronic disease, it would be ten screenings. 
And that information is available on the package selection page where that dropdown is. It will tell you the numbers.

**Speaker 3 | 30:51**
You it will tell me the numbers of the available screenings.

**Speaker 9 | 30:54**
Yup. So.

**Speaker 3 | 30:57**
Just to confirm cause you said on the previous page on the packages that the screenings are not exactly only for DU duplication.

**Speaker 9 | 31:06**
That's what I'm saying. So for the hard coding, the numbers that you need are in the Figma on that page.

**Speaker 3 | 31:13**
Okay, I see four packages. Yes, okay, that sounds good, and the verbiage stays the same like here.

**Speaker 9 | 31:22**
Right? Yeah, it would just be swapping out. It shouldn't be five though. 1234. I don't know where they got five.

**Speaker 3 | 31:35**
Back to 5.

**Speaker 9 | 31:47**
Let's pause on this one.

**Speaker 3 | 31:52**
Would you like me for now to just keep it simple, like a remove without these buttons and explanations? Just similar to how we add and remove individual chests?

**Speaker 9 | 32:03**
Yeah, okay, yeah, let's keep the numbers out of it for now, because I don't. Now, I'm confused because the heart and as heart and stroke risk screening is only four, so I think they're expecting you to add what's in the membership too. 
So I just need more clarity on this. So let's just keep it. 
Is generic. I would say just you can reab this on the previous step and remove the numbers piece.

**Speaker 3 | 32:40**
You still need to keep upgrade button and yes remove or just simple adding remove.

**Speaker 9 | 32:47**
I would say yes remove keep upgrade. That can all stay the same. I would just remove that first sentence where it says you'll go from 15 screenings back to five. Okay, just sketch that, please. Yeah.

**Speaker 3 | 32:57**
Yes, that's a good qualification, thank you very much. One more clarification here on this review page, please. Where in the Designs is the verbiage for the location exclusion restriction? I should say.

**Speaker 9 | 33:12**
If you go to packages.

**Speaker 3 | 33:18**
It's in the packages.

**Speaker 9 | 33:20**
Yes. And then if you go over, it's that last one right there.

**Speaker 3 | 33:31**
Okay, got it. Because I was looking for it on the review page. That's in the link is to the review page. Actually the that's why I was confused.

**Speaker 9 | 33:39**
I definitely copied it from this component.

**Speaker 3 | 33:43**
Yeah, by apologist, maybe I didn't see it, but I yeah, I was looking at the review page.

**Speaker 9 | 33:47**
Okay, yeah.

**Speaker 3 | 33:48**
That's cool. The other question was for the copyright. You said should not add that right now, and we'll add it later.

**Speaker 9 | 33:56**
Yeah, I will add an update Footer task once we get the design updated. I sent that over to Greg this morning, and we're just gonna have one of the Designers update the footer to what we expect to see.

**Speaker 3 | 34:08**
Okay? Okay, that's good. The final thing are the link to the terms and conditions on the review page for the membership.

**Speaker 9 | 34:21**
Yep, I sent that back in a chat.

**Speaker 3 | 34:23**
You did? Yep, that's great. I think those were my questions on the review page. Thank you very much.

**Speaker 9 | 34:32**
That was a quick note on that, though. Because the View Terms and Conditions link is going to our legacy page, can we pop that open in a new tab instead of redirecting them from here?

**Speaker 3 | 34:43**
Yes, certainly. Okay, yes, and that's it for me, thank you.

**Michal Kawka | 34:53**
Alright.

**Speaker 2 | 34:55**
And that's for. So let me recap for the membership, we are just gonna be holding this for later or we are gonna just say thirty dollars for no.

**Speaker 9 | 35:12**
So I'll drop it in the chat, but the membership discount functionality isn't defined yet. We just had that meeting last yesterday at four to understand exactly how we should set it up because it was not actually set up correctly. 
So hopefully we can work on that next week. So for the scope of the ticket of displaying membership in the cart, it just shows, first year free.

**Speaker 2 | 35:41**
Okay, and what about the checkout? What's the expectation for the checkout? When I hit checko? Should we do something about membership or just nothing for now?

**Speaker 9 | 35:59**
Nothing. So yeah, we shouldn't be applying a discount right now. I pull discount out of the scope for the current rate.

**Speaker 2 | 36:05**
So it's just like creating the subscription, right?

**Speaker 9 | 36:10**
Yup.

**Speaker 2 | 36:11**
Alright, I guess we should put hos in here right about the membership a list yeah.

**Speaker 9 | 36:21**
This doesn't show in that View. I didn't. Was that the Figma or the live site?

**Speaker 2 | 36:30**
Live.

**Speaker 9 | 36:31**
Okay, yeah, so it should be showing that they have selected membership, in the order summary.

**Speaker 2 | 36:42**
Yeah, but right now we don't have that in the Designer we need to figure out.

**Speaker 9 | 36:50**
So where it says membership savings.

**Speaker 2 | 36:52**
My digital confirmation. Let me get back to the yeah, summary here. Yeah, it only says the saving, but it's it doesn't say like membership like as a separate thing.

**Speaker 9 | 37:13**
Yeah. In the. In the tick. That I think CO has now it just says first year free when they don't have any additional things in the code.

**Speaker 2 | 37:29**
So we copied that bya behavior. So then we have the order summary here. So I guess I can use the same component that we have in this page.

**Speaker 9 | 37:49**
Yeah. Can you drop a comment on there really quickly that says need to know what the design is when there are no additional upsells for membership? 
No additional upsells.

**Speaker 2 | 38:26**
What the design Lu is Lu.

**Speaker 9 | 38:31**
No, you can just tag Greg for now because he'll decide who wants to work on it or who should work on it.

**Speaker 2 | 38:40**
Alright, sounds good. Other than that, yeah, I think we are pretty much like almost there. This is validating the card number. EI confirm what we get from the iPhone are like the if it's valid the car and if it's and empty, those are the two things. 
And we get the brand if it's Visa, MASTERCARD, AMEX if we want to put something nice here in the UI in the future. That's what we learn from recording at this point.

**Speaker 9 | 39:15**
They're not recording. Discover

**Speaker 2 | 39:19**
I guess so this is where I got from the design, but I was gonna ask that as well. Maybe we should add the this cover.

**Speaker 9 | 39:25**
Yeah, we should be, but maybe it's just a payment configuration on Recurrently. So I'll take a look and see if there's something we should be configuring differently.

**Speaker 2 | 39:35**
Yeah, but this thing here, our icons that are including here, those are not from Recordli or anything like that. Okay.

**Speaker 9 | 39:42**
Okay, yeah, we should be supporting discover as well.

**Speaker 2 | 39:46**
Okay, I can just include it here and maybe we can just have a nice design for the future. When we get the brand from the coolly, we can say. Okay, if it' visa, we can block out the rest and just make this stand up.

**Wesley Donaldson | 40:00**
We had a concern here around the friendly message coming back and wanted to change out the message depending on the type of exception that we get for the card if it's out of funds. Incorrect zip code. Incorrect C VV. Did we have that?

**Speaker 2 | 40:15**
Yeah, we were talking.

**Speaker 9 | 40:17**
That is returning a customer message for the different scenarios. So we should just be forwarding whatever the customer message from Ely is.

**Speaker 2 | 40:26**
Well, this is the thing. From recording we have two different e errors and validations. The first one is this one. This is like a live validation that is happening here in the browser. And this is only validating that this car is correct. This number is a valid number, and the these numbers are correct. 
If I put something here that isn'tcorrect, it's gonna throw like a validation error. But this is like client side from recording. Once we hit complete pushes and we do try to charge the user and the customer is when we are gonna get the those back in side errors.

**Wesley Donaldson | 41:08**
Okay.

**Speaker 2 | 41:08**
So there are two kinds of errors. This is like a simple one. It's just validating. This is a. It's a card number. It's a valiyan norm. It's not empty. And then when you hit this button, then we are going to try to complete the purchase and it's gonna we're gonna get the more elaborated like messages.

**Speaker 9 | 41:33**
Yeah. So I guess I'm confused where is there still missing requirements there because we're currently is returning everything we need to show.

**Speaker 2 | 41:45**
Sorry what do you mean?

**Speaker 9 | 41:49**
Wes, you mentioned that there was confusion or not clarity on the messages that are being returned.

**Wesley Donaldson | 41:56**
Ene is a requirement. Gap I think I was asking if we already had that implemented because we were discussing it yesterday.

**Michal Kawka | 41:57**
No.

**Speaker 2 | 41:59**
Okay.

**Wesley Donaldson | 42:05**
We just need to be presenting the message coming back from MCCURLEY in the event of an authorization fail or for whatever reason, that friendly message coming back from MCCARLEY.

**Speaker 2 | 42:14**
All right. Yeah, when we got those messages, I'm going to display the message like, I think here or even here underneath this car.

**Wesley Donaldson | 42:25**
So you need.

**Speaker 2 | 42:25**
I can'.

**Wesley Donaldson | 42:26**
Do you do we want to just itemize what those messages are and then we can have design tell us where they should go? Do we want to just agree they should all go towards the top of the payment section because I different.

**Speaker 2 | 42:36**
Yeah, just let me know when you want to have the message and I can put it there, but I know how to get the mesage.

**Wesley Donaldson | 42:39**
CE.

**Speaker 2 | 42:43**
I just need to say. Okay, let me put it here like using something like this and.

**Speaker 9 | 42:47**
Be inside the payment box.

**Speaker 2 | 42:49**
Like we can do something like this. Put this component here with the backend message. Yup. The only thing is that this thing is not going to disappear. Like when you put something correctly here, this message is being removed automatically. 
But for this one, I don't know, I need to. They us have to complete pushhes to revalidate.

**Speaker 9 | 43:20**
That makes sense to me.

**Speaker 2 | 43:22**
Yeah, alright, that's good.

**Wesley Donaldson | 43:27**
We could put a future enhancement for on focus on the checkbox on the any of the input fields. Then we can hide that message on like from the React side. 
But that could be a future enhancement.

**Speaker 2 | 43:38**
This is working in this way. The first time you try to put something here, it is going to validate on blue. On blue. I mean, when you click out of the element, if you are typing something, we are not validating. 
But if you go to the next one, it's validating.

**Wesley Donaldson | 43:54**
2.

**Speaker 2 | 43:54**
And then after you complete pushes, it's validating. On change, it means every time you input something, if that's incorrect, it's going to be validated. 
If something is correct, it's gonna be automatically, like, turn a like out of the validation. It's pretty much like the standard with validations. I am following the standards. It's like something like this. 
But this is something I wanted to ask you quickly. Do you. Do you want this component for the date of birth, or you want the user to be able to input by text? Or both?

**Speaker 9 | 44:39**
It should be both.

**Speaker 2 | 44:42**
Yeah. Because in the design, I think it was using like just the input, a regular input, but I just decided to use a component. But just let me know I can tweak this up.

**Speaker 9 | 44:56**
We can leave it for now, and then if we want to make changes in design or View, then we can implement or record it then.

**Speaker 2 | 45:04**
All right, sounds good. This is what I mean. If I put the email here now it's validating on change because I already hit this button. So this. We don't want to annoy the user when they are just getting started into this page, like throwing a lot of errors, we just want to validate when they start doing something and they don't do it properly. Example AG now is gonna work. 
If I hit here, it's gonna be live validation.

**Speaker 9 | 45:41**
We have to jump over to another meeting. But I think once we get the full end flow done, we can do. And you guys have done the tweaks that you've already found. We can do another review and notate anything else that we would like adjusted. I want the Designers to run through it as well and make sure that they are writing down their notes. I just didn't want to waste their time until we took care of the things that we knew had to happen.

**Wesley Donaldson | 46:11**
Okay team, let's drop. I think let's do what we did before you alls if you can join the product. AV, I think maybe you all this I'm thinking maybe Germany and Lance can join as well simply because we're discussing the recurring implementation and they're both helping with that any objection to that.

**Speaker 9 | 46:33**
Be there, have a good one.

**Wesley Donaldson | 46:34**
Nice. 
All right, guys, see you. Thanks all.

