# Mandalore DSU - Mar, 02

# Transcript
**yoelvis.mulen@llsa.com | 00:30**
Hello again, guys.

**Wesley Donaldson | 00:33**
Morning all.

**Nick | 00:34**
Good morning. Hey, Wesley, does the indoor team.

**jeremy.campeau@llsa.com | 00:44**
Still need to join these?

**Wesley Donaldson | 00:47**
There is nothing on. I mean, Dane has few items or one item, but Nick, I don't think you need to join. And then we can manage Dane's task without having him join this board, this meeting tic.

**Nick | 01:01**
Okay, cool.

**jeremy.campeau@llsa.com | 01:02**
All right. See you, guys.

**Wesley Donaldson | 01:09**
Okay. We have a lot to cover. 
So let's jump in. Shoot my screen. Okay. So as I mentioned in the previous call, we're not going to have all of the refinement items outstanding. However, that it's a great place for us to start the refinement items. 
So let's take a look at that. 06: twenty four. 
Okay, so we still have a few things that are in process, playwright stuff. We're good on JFFCO. You got the product selection, the review page items not including the stuff we discussed this morning, but those look like they're ready for prod. The checkout page that's in review. What's left on the checkout page? Or is it just you just literally waiting for someone to approve the PR? 
Sorry, this is on your office. Sorry, this is check out your us are you there?

**yoelvis.mulen@llsa.com | 02:17**
Yes.

**Wesley Donaldson | 02:19**
Can you just what's outstanding on this page? Is it just like we still have building information, payment information. Again, I know these are very much in process. Anything remaining on the checkout page other than the items that we talked about this morning, the.

**yoelvis.mulen@llsa.com | 02:37**
Yeah, I just mentioned you. I think we have to take for the we using the order summary section and other than that is like.

**Wesley Donaldson | 02:48**
Yep, we have a ticket for that.

**yoelvis.mulen@llsa.com | 02:55**
No, I think we are pretty much like in a good standing. The date that we wanted to make it like that the user can input a data and TED like that. 
But, yeah, in general, is complete all.

**Wesley Donaldson | 03:12**
Okay.

**yoelvis.mulen@llsa.com | 03:14**
Yeah, I would say yes, if you are okay with, everything I share.

**Wesley Donaldson | 03:15**
Nos. Let's look at your board then, because you have a few of those checkout related items. 
So all these, I guess my question would be, can we move those to ready for prod?

**yoelvis.mulen@llsa.com | 03:43**
Yeah, it's pretty much everything is pretty much done.

**Wesley Donaldson | 03:44**
Yeah, I think we still have the items that we identified, but yes, we had the PERD session. 
I know that conflicts with what we just talked about because we want to persist some portion of this of the object, but what do you think? What's your.

**yoelvis.mulen@llsa.com | 04:03**
We can assign that to Jeremy if we just want to do this in the confirmation page. It makes a lot of sense for me. So it's a very easy use of fag or things like that. [Laughter].

**Wesley Donaldson | 04:18**
Right? So let's make that update. Actually, let's just do a little bit more. Yep. All right, Jeremy, that is on you. Okay. Leverage existing review page order summary component. This is a conversation between you and CO.

**yoelvis.mulen@llsa.com | 04:39**
Yeah, I'm gonna work on that one.

**Nick | 04:42**
Yes, now everything is merged so you can just take it from Maine.

**Wesley Donaldson | 04:50**
Okay? Do you feel confident this is something that's doable in the next day or so?

**yoelvis.mulen@llsa.com | 04:57**
Yeah, of course, sure it can be done today.

**Wesley Donaldson | 05:00**
Perfect. The order total component. Similar idea. The footer we talked about, well, it's kind of specific to just a footer area, remember?

**yoelvis.mulen@llsa.com | 05:08**
I think that's the same. Right? It. The what's.

**Wesley Donaldson | 05:14**
Like. And mobile. This is like its own component.

**yoelvis.mulen@llsa.com | 05:23**
All right. Yeah, I thought those were like the same thing, but, yeah, we can do it.

**Wesley Donaldson | 05:31**
Okay, well, they're the same.

**yoelvis.mulen@llsa.com | 05:32**
Yeah, that sounds good.

**Wesley Donaldson | 05:33**
If I'll put it in progress. You can kind of take a look, make sure there's no overlap between the two of them. So, Jeremy, you just got a new ticket on your plate. The confirmation, the purging epic. How are you doing with the calendar? How are you doing with the just the STA the static visitor information, which I guess now we're actually pulling from storage is.

**jeremy.campeau@llsa.com | 05:56**
Button the calendar button PR is up and in review, so I'm now working on what we talked about on the other meeting with making sure that I'm grabbing the visitor participant info from the local storage and displaying it at the top of the confirmation page, and then I'll probably just do the thing that we just mentioned. The ticket you just assigned to me. Just because it's kind of like the same area. 
So I'll probably bundle those two together in the same PR.

**Wesley Donaldson | 06:27**
Perfect. So you're working on those right now. So this was just the goal for this was just to prove that it's dynamic. These are all the same things. 
So this is a bug that Devon created that basically challenges our ability to hydrate. That that's, how we're gonna do it. And this is the actual purging necession store. So all these are the same tickets. Effectively.

**jeremy.campeau@llsa.com | 06:49**
Okay, yeah, I'll review the other two that I just got assigned and, you know, make sure that I do all three in the 1pr that I put up. Speaking of that, I did just try to rebuild my PR so I don't know if this is still an issue, but are we still having an issue with the builds? 
Because I won't be able to deploy if that isn't resolved. I just don't know if it's resolved yet.

**Wesley Donaldson | 07:12**
Nice sawe to you, Miham.

**Michal Kawka | 07:15**
I'm sorry for running late. I was deep in those any and deployment issues, so I discovered the issue. Basically we missed the e commerce store from the Destroyer job. So the Destroy jobs were working fine. They were succeeding all the time for the past few days. There were no errors except for some minor issues. 
But the e commerce store was not included in the Destroyer jobs and it cost the it caused the stacks and the EN is to pile up. I removed the manually now and I included the e commerce store in the Destroyer job, so hopefully we won't run into this issue again. We didn't notice that because of course, the jobs were passing and there were no failures. 
Yeah, so the cleanup should be done. I'll try to redeploy your PR, Jeremy. And I think we're good. So I'll be monitoring the situation. If it happens again, I'll take immediate manual steps, but I think we're good.

**Wesley Donaldson | 08:18**
Meha just that's a great segue into the other item that we talked about this specifically around what is the approach we're using, what is the rationale enabling another engineer to kind of do that same ticket that you just the same activity that you just described, how are you progressing on this? As I mentioned. 
Like. The goal is commerce, but I definitely want to get this done this week. We would love to target Tuesday or Wednesday to actually have the first passives.

**Michal Kawka | 08:48**
I haven't really made much progress on that yet. I'll be focusing on that today after the standup. I hope to have some news for the standup tomorrow.

**Wesley Donaldson | 08:58**
Okay, where are we with the playwright tickets? Outstanding.

**Michal Kawka | 09:03**
They are ready for RE. All of them are ready for RE.

**Wesley Donaldson | 09:11**
I will look into what? That is not clear. On what? That are you clear what this ticket is I think more on that the app definitely things could have happen for the.

**Michal Kawka | 09:19**
I believe it is outdate. It was created by Jennifer probably one week ago or something. I already posted the analysis about the alerts. 
So we had a few alerts firing. They were mostly false positives. There was just one about the Athena. But I believe this needs to be taken to the architectural meeting to discuss the approach on how to handle that.

**Wesley Donaldson | 09:41**
An okay, I'll go back around with you just more detail on that.

**bethany.duffy@llsa.com | 09:47**
That makes sense. Typically, the outcome of a triage is a proposal, and then from there we create the work items.

**Wesley Donaldson | 09:56**
Okay. Sounds good. JEJFFCO.

**Nick | 10:07**
So I moved all my items there with a single ber per on the ticket. 06:27. That was for the review page, but actually I added the changes for the products page there as well. Thank you very much, Jeremy. For the pump review, I was able to merge it earlier this morning. The only thing I saw from that review today was the hard coded list of products on the packages, and which I think that other ticket you referred to was when I was talking to Beth about calling the membership items. 
And I did that as part of the 06:27. But certainly we can hard core this products here as well if you open the ticket please. I posted deal what we currently are getting from Rick Curly. I was just wondering whether you guys would definitely like to hardcode this or instead just set up the proper names in the record and we can pull the data there because otherwise they will be pretty work later on. That would be my only question here. 
If you prefer hardcoding, then please send me the, lists of all the products in HO.

**Wesley Donaldson | 11:15**
I mean. Bet you're here. I think the direction we had from you last time we connected on this was to hardcode them. 
And if you have a different perspective or if you think it's fast for us, this is dynamic already. Jeff is right. If we make it hard coded, we're gonna have to update it in the future to make it dynamic.

**Nick | 11:29**
2.

**Wesley Donaldson | 11:29**
But open to the floor, yes.

**bethany.duffy@llsa.com | 11:33**
The implementation right now is dynamic. Okay, then I will go ahead and add the field for basically like status of whether or not we should display it, if that is an easy enough thing to pull, similar to what we're doing for the membership plans.

**Wesley Donaldson | 11:59**
Think we need the friendly move. So right now we have CA a and we have the product code. It's CA so we want something, that's friendlier visually for the user.

**bethany.duffy@llsa.com | 12:10**
Well, the names should be coming from the design. That's not hard coded any or that's not dynamically coded anywhere inside of a curly unless you're grabbing it from where the name should be pulled from. Recurley actually, the item name is there.

**Nick | 12:32**
Exactly. And that's what recuurly repond with CA. So that's why I'm saying it. If you fix it in the.

**bethany.duffy@llsa.com | 12:38**
Recovery is not correct. No, in recurly it's configured to say. Hang on, these are my test items that need to be deleted. There should be additional ones that are being returned.

**Nick | 13:01**
Okay, I can check the query again, but just to make sure that the names are properly set up in the records.

**bethany.duffy@llsa.com | 13:08**
What? I'm. Yeah, I was just. I was playing around a configuration to see what their features were capable of. These ones are not ones that we will sell. So I think we do need a status for ones that. I don't know. 
Maybe we need to discuss this in product office hours on the best path forward for right now because there are only three diagnostics that we're going to sell in the add on area, and the only restriction for them is whether or not they're in the location based list, which is another thing that we need to talk about today.

**Wesley Donaldson | 13:47**
Okay. Jeff, can I ask you to please just join the products? Sy can we can solve both of those there?

**Nick | 13:55**
Certain, yes.

**Wesley Donaldson | 13:58**
You know, we're almost at time. Lens touched you had some order specific related items as well.

**Speaker 7 | 14:09**
There's she going out with Elvis stuff, so this can be.

**Wesley Donaldson | 14:15**
So those are done.

**Speaker 7 | 14:19**
And the spike was related to the coat last week.

**Wesley Donaldson | 14:26**
This was not directlyly related, but something that we wanted to tackle. Can you just share? Is this it? Marks ready for production.

**Speaker 7 | 14:36**
Yeah, there's a cha request submitted, so the plan would be for it to go out tomorrow afternoon.

**Wesley Donaldson | 14:45**
Great, sounds good. Stefan, over to you. Sorry.

**Speaker 7 | 15:02**
Does TS can you hear me?

**Wesley Donaldson | 15:03**
Yep, good.

**Speaker 7 | 15:05**
Perfect. So, yeah, good morning. So five G7 is in preview. I'm I have some folks, actually. I've pied, I've tagged the Elvis and Nicole to preview that. Is there anyone else I should be taking for the other reviews by back 558 is in progress.

**Wesley Donaldson | 15:23**
No, that's a good list. Okay, and 558.

**Speaker 7 | 15:30**
I've created tests, and I've. I've covered the functionalities of the task, but I'm getting some failed tests, so I'm going to double check on everything, and I'm probably gonna check with Nicole on. There's a question about the package selection spec file, and because there is, some tests are filling on the mobile application. 
So I'm gonna double check with Nicole on that, whether I should try to fix it or not. Or maybe should maybe there's a problem, but that's in progress. The tests are completed. I am planning on open up a preview later on today. 
And the next step I'm planning on IOA preview on 06:20, I think. 06:40? Sorry. Because I know. Mial asked me a long time ago to review it. So that's. That's the goal.

**Wesley Donaldson | 16:32**
Sounds good. My apologies, team. I do. Unfortunately, I have a hard stop at 11:15, so thank you guys for status. Let's please just stay in contact on PR reviews. 
And I if you're clear on what action items for coming out of this morning session, please tackle those while I get you guys some tickets for them. Thank you so much.

