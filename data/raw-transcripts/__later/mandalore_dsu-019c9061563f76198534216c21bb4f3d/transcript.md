# Mandalore DSU - Feb, 24

# Transcript
**Antônio Falcão Jr | 00:01**
Yes.

**Wesley Donaldson | 00:21**
Good morning, team.

**Antônio Falcão Jr | 00:25**
Hello.

**Wesley Donaldson | 00:29**
Guys, let's share my screen.
Okay, let me know when you can see my screen. So we have a lot to cover today, so I'm going to jump right in. As I mentioned in the Slack group channel, I think we still need to get to a clear known state.
I think yesterday's meeting was really good, but there are still a few outstanding things. The fastest way to get to that, I think, is to go by teams. Then I'm reconciling on the backend based on what you guys' status is.
So let's jump straight in. Antonio, let me start with you. Let's still try to go from right to left. If we could, please...

**Antônio Falcão Jr | 01:16**
Yeah, sure. So this is basically the only step remaining is the reconciliation work. As you guys know, we had a problem with a handler last week, and a few messages went to the dead letter queue. So the dead letter was configured with only four days of retention, so a few of them got expired on time, and we got back to processing those.
So basically, I need to pair with DPVs and Harry just to coordinate how we're going to run this reconciliation script alongside we are working on the actual fix of this in a different ticket.

**Wesley Donaldson | 01:56**
No.
Thank you. So Harry, Antonio, and myself, and you, maybe we will connect this afternoon and just figure out how we want to... There's already Antonio's provided a plan as well as a script to get us back those events.
So let's just maybe peer a little later this afternoon to make sure we can come to a resolution on those missed events.

**Speaker 3 | 02:26**
Sounds good.

**Wesley Donaldson | 02:28**
Excellent. Let's keep going. Dane. You had a few things left over from yesterday on the review page. You're going to close those out so we can pivot to Jeffco owning the review page. Are you here?
That is basically Dane's status. I'll confirm with him, but he should be good to go, and Jeffco is going to be taking over the review page for him. Devin, there are a few things on your plate you want to give us an update on how you're progressing on these review tasks.

**Speaker 3 | 03:03**
Sure. Yesterday I was looking into these two on the new site. I just want to confirm that the changes that are on the site, are those changes merged into the main branch I am able to pull down, or should I just continue working from the site or validating from the same?

**Wesley Donaldson | 03:38**
Y us. I think that's for you. Good sir.

**Speaker 4 | 03:44**
Can you elaborate on what's the...?

**Wesley Donaldson | 03:46**
He's asking where he should be testing. He's looking for a dedicated location where all of the work that we've done is available for review. We used the sandbox site yesterday.
I think that's the answer, but if you can confirm...

**Speaker 4 | 04:01**
Yes, that's correct.

**Speaker 5 | 04:03**
I would second that from product. I do have to demo our sandbox on Friday, so that one needs to be as close to when it needs to be.

**Speaker 3 | 04:12**
Okay, yeah, I've found a few things, so I'll log them under the epic that we spoke about earlier, Wesley.

**Wesley Donaldson | 04:26**
Okay, yeah, just, okay, perfect.

**Speaker 3 | 04:27**
That's right, I'm mad now.

**Wesley Donaldson | 04:29**
Just anything you create, let's keep it underneath that one epic. If there's something that you're working on that's not underneath that epic and it's tied to one of the feature epics, if you could please move it there, change the parent to that.

**Speaker 3 | 04:42**
Okay.

**Wesley Donaldson | 04:43**
We'll skip Francis for now. Harry, you should have nothing. Jeremy, you survived.

**Speaker 3 | 04:50**
I moved.

**Wesley Donaldson | 04:51**
Are you here?

**Harry | 04:52**
Sorry, those Dall-E ones, I moved those over. I drained the queue yesterday, but like Antonio said, I got 8,000 cleared, but there are still a few thousand that we will have lost the PR to up those retention period from four days to 14 is in.

**Wesley Donaldson | 05:10**
Okay, Harry, I think we need a hearing session. Just you, myself, and Antonio. Just Antonio and yourself just to get to a resolution on that. How are we going to move forward on the fixes?
So we'll find time this afternoon to connect with you or Antonio. If you could please prioritize finding time to connect with Harry. Okay? Thank you.

**Harry | 05:31**
Okay. I have to move. I have a number of issues around you. Remember the old Cognito pool? We're going to deprecate that now. So I do need to move into that work. It was work from December that got shelved, which is now back on the table.

**Wesley Donaldson | 05:50**
Okay, let me just... Sorry. Let me just get through the rest of the stand-up. Then maybe we could come back to that or FA time this afternoon. Jeremy, I don't think you're here. I saw a message from you, but you are not working. I'm clear on what Jeremy's working on. He's still prioritizing the checkout specifically, the ability for us to complete the checkout flow.
So no worries on Jeremy's time...

**Speaker 7 | 06:18**
Thank him. Good morning. So as we agreed yesterday, I'm taking over the review page. The first thing I did was to integrate with the endpoint and to retire the mocks. About to put the commit for that worked with Jane on his PR yesterday and this morning we were able to touch base and work again, and we were able to merge.
So I'm about to pull his changes as well, integrate into my PR, and then continue working on the review page. Right now. I think tomorrow at some point I should have the review page completed. No impediments at this time, thank you.

**Wesley Donaldson | 07:00**
Okay, perfect. The state based filter is that work? If I think I saw you are you just clarify for me the state based filtering. Is that part of your general diagnostic general like review page effort, or is that like you're doing that separately as part of this ticket?

**Speaker 7 | 07:19**
It's part... So the tickets no longer represent what I'm actually working on, but I just moved there ahead because testing still needs to be implemented, right?

**Wesley Donaldson | 07:23**
Exactly.

**Speaker 7 | 07:29**
So it will be part of my review. I'm just doing more than the tickets.
But yeah, it will be part of the review.

**Wesley Donaldson | 07:33**
Understood. Jiffco hits a very important point, I think. And that's not a knock on the team. I know we're making best efforts here. We've done a lot of work, maybe not necessarily directly tied to a ticket.
So where... I still need to... We still need to true up the state of the board or the state of our planet. So please, as Jeffco is doing, grab these along with you. If you're working on just getting the page right, you probably have a few things that were left behind that are part of your effort. Just drag them along with you, please, and I'll touch on...

**Speaker 5 | 08:07**
Are there already tasks for those that just need to be put in the right spot, or do we just need subtasks so there's visibility for the rest of the team?

**Wesley Donaldson | 08:12**
They're tasked for them. They're already tasked for most of them. There's some stuff that had epic level, but I created a one-off implementation ticket on each one.

**Speaker 5 | 08:17**
Okay.

**Wesley Donaldson | 08:23**
But generally they're already tasked for them.

**Sam Hatoum | 08:26**
Quickle.

**Wesley Donaldson | 08:29**
Or you las.

**Sam Hatoum | 08:35**
There's an item in review not directly related to drive. We found it during investigation last week on a hotfix. Basically, we're not sending screening ID and participant ID when we send lab orders. A spot from a lab order tool. This fix has already been made, but added to the board as still have to validate it and then submit a CR at some point.
It's just here for correcting.

**Wesley Donaldson | 09:08**
Okay. Can you speak to just the progress on the spike? Have you had a chance to look at that yet?

**Sam Hatoum | 09:15**
Yeah, there's a... As part of the spike, I added an endpoint to the graph to submit to recurringly, just with some initial functionality based on some assumptions, so that it's likely going to have to change.
There's a PR out there that's open for full review. So whoever is working on the checkout page, I can probably work pretty closely with them to just update the graph as needed.

**Wesley Donaldson | 09:48**
Yep, that would be...

**Sam Hatoum | 09:49**
And...

**Speaker 4 | 09:50**
Then...

**Wesley Donaldson | 09:50**
But I would say you all this... I think it makes more sense for you to parrot Lance on that. Just as the overall owner of the ability to get us through the payment step on order confirmation.

**Speaker 4 | 10:01**
Yeah, I need to think out with Jeremy to understand where he's at and we can continue from there.

**Wesley Donaldson | 10:11**
Okay. But like Lance's great job, that's super critical for us.

**Sam Hatoum | 10:12**
Okay.

**Wesley Donaldson | 10:15**
Great that you already have a first pass at that.

**Sam Hatoum | 10:20**
One small thing. I don't know if this was mentioned. It is... I recall yesterday, but I don't recall who's working on the final tweets to the packages and membership page. But I know that we do need to update the graph to include the ramp pricing so that it can display properly.

**Wesley Donaldson | 10:39**
So I'm sorry to interrupt. Just to keep us going, I'm going to have a meeting just like our office hour. Checking with all the engineers.
I think we only need half an hour just to go through what we distilled as a team yesterday. Then, as part of that, Jira per agreement, you have been prioritized on review. We need to do the same thing for the appointment page for the product selection page. Check out... As you and I are right now on... There needs to be a confirmation page here as well.
But we'll do this as a team, and then we'll pull these into the board hopefully within the next couple of hours. Okay? So don't worry. We absolutely need it. We have a plan for it. Let's keep going. I'll go over to you.

**Michal Kawka | 11:25**
Hi everyone. I had to make a few tweaks to the card state debug mode, so it should be ready for review now. As we discussed yesterday, I'm going to support with the Playwright test right now. So... I'm going to pick up MDL 58.

**Speaker 10 | 11:39**
Five.

**Wesley Donaldson | 11:41**
Okay? Meha, yours is a little straightforward for the next round, all of the... I've moved a couple of the Playwright stuff over to you, but I think Stefan read the conversation between you and all of us, Stefan and yourself is going to be the future owner of some of the Playwright work. We'll do that as part of that engineering sync as well.
Okay, Nick, over to you. Good...

**Speaker 10 | 12:07**
See, yeah, the nav bar is ready for review, it's just small changes, nothing in nature and the footer... Who should I get with on that? I need some advice on behavior I can't really tell from Figma.

**Wesley Donaldson | 12:27**
Okay, I think that will probably be the product direction.

**Speaker 10 | 12:29**
Sure.

**Wesley Donaldson | 12:30**
Sorry, Beth.

**Speaker 5 | 12:32**
Yep.

**Wesley Donaldson | 12:34**
Do we...? Perfect, and does anyone else have...? Go ahead.

**Speaker 5 | 12:34**
If you want to kick off product office hours with that, it should be quick.

**Speaker 10 | 12:39**
Okay. I'm sorry, I was just going to say I have a few production support items on the roadmap, so I'm doing that as well.

**Wesley Donaldson | 12:50**
Okay, if anyone else has items that they're not clear on and they need product support, please raise your hand.

**Sam Hatoum | 12:50**
That's it.

**Wesley Donaldson | 12:57**
Beth and team are available for us in the product app dev sync, so we should be bringing those questions to them.
If there's anything on uncertain, let's keep going.

**Speaker 5 | 13:08**
You can drop them in that chat throughout the day as well. I am expecting there to be discrepancies across Figma just because we've been updating as we're going. So there may be some flows that weren't updated.
So anytime anything pops up, you don't have to wait specifically for that meeting. You can just put it in the chat.

**Wesley Donaldson | 13:28**
Thank you. You're across a few things. One specific ticket that I left on you is for the checkout page so we don't have to go through this in great detail because it's the first time you're seeing it.
But more importantly, if I can ask you, before we do our sync, if you can please just go through the items that we have here. These are just distilled from the meeting that we had yesterday afternoon.
If I can ask you to review through that. And then when we sink back as a team, I want to go through each one of them, which is just like a task that represents what was actually identified here and then make sure we can get the assignments worked out.
Nothing that I'm aware of that's assigned to you. But if you wanted to share what you're currently working on, one...

**Speaker 4 | 14:13**
Yeah, for me today I've been working on learning all the business rules that we have and recording. So I am doing some research and creating a document with a summary of everything. So I just think that's one of the pieces that we need to clarify as soon as possible all the details of the cases and everything that we could... So we can deliver this on time.
So I'm working on that. But other than that, I'm going to be happy with helping with the checkout page and whatever is needed.

**Wesley Donaldson | 14:53**
Sounds good. Yeah. Again, my big ask to you is if you can please just take a look at 06:24. Right? Anyone else has anything they're currently working on that they have not shared already or anything that they're blocked on or they're not clear on the next action they're taking?
Excellent. Okay, guys, thank you so much. I'll get a meeting on the calendar for us to go over 06:24. As BET said, if you have questions for the product, please put them inside the chat.
If there's something more detailed you need to present or talk through, we can join the product app sync. Thank you guys so much.

**Speaker 4 | 15:40**
Later.

