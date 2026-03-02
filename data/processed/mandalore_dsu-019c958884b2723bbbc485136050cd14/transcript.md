# Mandalore DSU - Feb, 25

# Transcript
**Speaker 2 | 00:11**
Good morning to the FA.

**Wesley Donaldson | 00:13**
Good morning. All... With me one second. All right, let's see who's on the call for us today, okay? All right, so Jeffco is not going to be able to make this call, but he did share his status. We're going to go through... There's a lot going on.
So we're going to go through this by team member. Then I'm going to start with you because you've taken on a lot of work, and that's bringing us all together. So maybe let's start with you. What are your priorities and what are you working on?

**Speaker 3 | 00:55**
Yeah, I've been working on the checkout page. I took the work that Jeremy did for participant info, and I am doing the rest of the page. I am incorporating recordly into the payment components and doing the validations for the rest of the components. Everything is regarding validations... It's pretty much done. I am just now integrating with the packon that Lens created and making sure it works.
Yeah, those were a few tickets. I'm going to see how to approach them to create a PR with... That makes sense.

**Wesley Donaldson | 01:44**
Okay, yeah. So just keep an eye out. There are a few epics that have small bits of functionality, all relative to the same area. I think I've caught all of them, but I'll take another pass at the epics to make sure you have them, and I'll throw them over to you.
So the next natural... I'm just going to do the backend really quickly because that's the most critical task right now. Lance, I'm going to go to you next. You should walk through what you're focused on.

**Sam Hatoum | 02:16**
Yeah, I'm supporting anything done with the checkout page and then still researching how certain mechanisms work within Recurly because it's going to have a pretty high impact on the other side of this when we import it.

**Wesley Donaldson | 02:28**
The so one additional thing.

**Sam Hatoum | 02:32**
So I'm trying to get a really good feel for how the coupons specifically work and how they differ based on. I think it's there if it's one of our member perks versus a hard care coupon that they add. We do need to differentiate.
So I'm still just researching how the re-enrollment system and handling things.

**Wesley Donaldson | 02:57**
Okay, sounds great. Just keep an eye on how subscriptions versus diagnostics are added. I think that was a core thing that we identified a few weeks back. We want to make sure we're handling that correctly, especially with the direction that we're going to have multiple membership types or subscription types be active at any one point. Cool. Let's get you an actual ticket that describes some of that investigation activity.
So we can reflect your work here, but you and I can connect offline on that.

**Speaker 3 | 03:32**
Okay, there was a spike.

**Wesley Donaldson | 03:32**
Let's move on.

**Sam Hatoum | 03:35**
I don't know if that got moved or completed, but you...

**Wesley Donaldson | 03:35**
Yeah, I moved that spike off you just because you had already committed that PR so that's actually... That's on me. I can flag that as completed. I can create another one since that informed the work that you're obviously doing.
But I'll create another one specifically for you. Let's go to you, Jeremy. I know this is fast and moving. But do you want to speak to just what your understanding of this one is?

**Speaker 5 | 04:04**
Yeah, so there's already the page for it in the repo and it does pass the appointment and, I guess, tests or whatever we call them that you've purchased. So the UI is mostly done. The email and the... I think there was something else that was hardcoded. The order number.
So I feel like the ticket is mostly completed. It actually needs the back-end stuff to either be done if it's not or created. So I don't know if that ticket is reflective of what still needs to be done.

**Wesley Donaldson | 04:52**
Yeah, so it's more reflective of just the intention around getting the Designs buttoned up. Yes, you're absolutely right. We have an initial skeleton of the design, but we'd identified quite a bit of... This doesn't... For desktop and mobile, it doesn't fully align to the Figma, so I think that's the main task right now. This has not been fully refined yet, so we don't have enough for us to fully detail out what the back-in integration would be. Your all this if you implement something...
I think we still want to give the product the time to explain to us what the business rules need to be. So whatever we have a back-in perspective is fine now, but just be aware that we still need refinement on this to get to full clarity.

**Speaker 5 | 05:32**
Okay, I'll find the I'll look at the Desktop view then and compare it. Yeah, look at that.

**Wesley Donaldson | 05:40**
Okay, no worries. Let's go back to the very beginning. Antonio.

**Antônio Falcão Jr | 05:52**
Good morning. So right now, and focus on this reconciliation script running process. Talked to Harry this morning. It's supposed to be a good time to do that because we're going to have a job running in a few hours from now.

**Wesley Donaldson | 06:06**
Yeah, I don't think...

**Antônio Falcão Jr | 06:10**
So I'm going to do that just after this meeting. As soon as I finish this reconciliation, we'll go back to the schema adjustments that I ran on the 4497 tickets.

**Wesley Donaldson | 06:27**
Okay, just to confirm, that's ticket for 36, which is the fix for the... So I put that in process for you.

**Antônio Falcão Jr | 06:35**
Looks outdated if you refresh, it's supposed to be correct.

**Wesley Donaldson | 06:43**
Okay, no worries.

**Antônio Falcão Jr | 06:44**
Okay, thank you.

**Wesley Donaldson | 06:46**
Dana, I'm not sure if you're on... Harry, do you understand my take on this? My take on this is that it's already done. I saw that their PR was actually merged in. Any objection? Anything you have outstanding or any objection to us moving this to Donn?

**Speaker 2 | 07:03**
No objection. Let's move it to...

**Wesley Donaldson | 07:04**
Okay, cool.
Nothing outstanding on your mind specific to just the checkout process?

**Speaker 5 | 07:14**
On my mind, no.

**Wesley Donaldson | 07:15**
No. Okay, perfect.
Devon, I'll come back to you. I'll do... It goes really quickly. Beth, I think he messaged you in teams on this, but we're just looking for some design support, specifically around how to display the state validation message for diagnostic for the diagnostics.

**Antônio Falcão Jr | 07:40**
The tickets updated with the Figma.

**Wesley Donaldson | 07:42**
Bless your heart.
So we already have that. Great, I'll confirm that with Ico and connect with him. But he confirmed that assuming he had the designs, he felt comfortable he could get these tests by the end of the day. So good status on that. Apologies. He can make it just a conflict with his son's doctor's appointment, I think.
That is... Did I miss anyone? Not including Devon. Nick, let's do... Apologies.

**Speaker 7 | 08:11**
That's fine. Have PR up for the footer, but may have to make some changes per Yovis request and then appointment page. Still have to do the stepper.

**Wesley Donaldson | 08:28**
So I created another ticket.

**Speaker 7 | 08:29**
Section.

**Wesley Donaldson | 08:30**
There was quite a bit of conversation around that last couple of times we met. So I created another ticket that just had more detail and a more focused effort around the breadcrumb navigation.
So I moved out the secondary elements inside of this ticket. It's just a move them. I made a note here to just be aware of that, just to separate out the two.

**Sam Hatoum | 08:51**
Okay. All.

**Wesley Donaldson | 08:52**
Cool. Anything else other than the current refinement that we're doing around appointment because you're... As the owner of appointment.
Then just the breadth, the additional navigation footer breadcrumb that you're working on for Commerce.

**Speaker 7 | 09:10**
H. No, I don't have any blockers.

**Wesley Donaldson | 09:12**
Nice. Then just as far as... Do you feel comfortable that we can have all of these by the end of the day, worst case, end of day tomorrow, but ideally, end of day today?

**Speaker 7 | 09:22**
I think so.

**Wesley Donaldson | 09:24**
Okay, awesome. Love it me how over you.

**Michal Kawka | 09:31**
Hi team. So the debug view is so ready for review. I picked up a playwright ticket like we discussed in the refinement and the other meetings, so working on that. There's one ticket that Stephen created.
It's about the implementation gaps in the ticket. 05:10. So I think I'll pick it up, resolve the implementation gaps, and then carry on with the playwright, of course. Happy to disagree, but I think we should resolve those implementation gaps as soon as possible.

**Wesley Donaldson | 10:06**
I agree. I did see it as well. Who is the card assigned to me for that? I don't see that.

**Michal Kawka | 10:14**
It's STN. And the ticket number is? 64o.

**Wesley Donaldson | 10:21**
640. 640. Okay, worries. If I, as I said over teams, can ask you to just find 15 minutes to pair. I want a consistent effort across the playwright work and a similar idea. My expectation or hope for the playwright is it's not a blocker for getting us to the demo, but I'd like to be able to say we can have all the playwright that's prior to the review page completed by the end of the week.
So I would leave that to Stephen and me. How as well do we have a do we have thoughts on that as a goal?

**Michal Kawka | 11:11**
I think I would be able to accomplish the tickets that are assigned to me. So I have four tickets on the table right now. I think it's achievable till Friday, till the demo. I don't want to overpromise, but I think that the most of them, or maybe even all of them, should be done till the demo on Friday and ready to demo.

**Wesley Donaldson | 11:32**
I called out specifically the review because we still have a few things on the review page specifically around product selection as well as the members. So there's still a bit of work there as well as there's work behind the purchase button.
So align there if we can just focus on before the completion of the review, before the payment on the review page pick thank you.

**Speaker 2 | 11:56**
Yeah, just to jump in block li.

**Wesley Donaldson | 11:56**
S.

**Speaker 2 | 11:58**
So I have one ticket that is in preview. I got one approval waiting for... I think one more. And I just picked up the package selection flow ticket, which is 05:57. Then there is a 05:58.
Yeah. So I don't want to promise that everything is going to be done by the end of the week, but I'll definitely try too.

**Wesley Donaldson | 12:21**
Just giving us a goal, make best efforts. Okay, right, that's everyone. I'm going to quickly just show... We mentioned that midsprint check-in that mid-effort check-in. Again, this is from the meeting that we had on Monday, just summarizing all of the smaller things. As a team, we had agreed that we don't want to go super heavy on individual tickets.
So I've documented the high level of what the issues were from our review as well as called out individual page-level tickets and then added that detail at a page level. So if you're if you own a page, I'm looking to you to kind of say, hey, I am the owner of this page.
I'll review them against the Designs if there's a gap or someone raises a concern like, we're looking for you to take ownership of that page and just kind of spirit it through. So I would say, please pull.
Like ask folks if like, hey, is there something you're missing? Your vi this is owning much of checkout. So if there's something he's missing or something's not coming over. Product has a bit of feedback. I would ask team members who are owners of pages, it's on you to kind of address that feedback and get that feedback.
I'll help with that, of course, but like, let's take ownership the pages. All right, anyone have any questions? Uncertainty not clear on what their next task is. Lance I will connect anyone other than Lance unclear what their next task is. Devon you and I will connect
All right. All right, guys. So, again, our goal as the team is. We're trying to get to completion by end of week, by Monday morning. That's intentional. I certainly don't. Not explicitly asking folks to work on the weekend, but like, setting the expectation that Monday morning is our goal if we need a little extra time here and there. Let's talk about let's raise it up.
But like, let's get this thing completed for the product team to demo early next week. Thank you so much for your effort, guys.

**Antônio Falcão Jr | 14:24**
A one guys have a good one.

