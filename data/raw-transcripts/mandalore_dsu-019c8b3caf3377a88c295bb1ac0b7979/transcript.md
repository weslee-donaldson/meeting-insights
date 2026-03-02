# Mandalore DSU - Feb, 23

# Transcript
**Speaker 2 | 00:00**
[Laughter] Amazing. Great start of the week too.

**Speaker 3 | 00:08**
My oldest is potty training and I invented the poop fairy at my house as like a daily incentive. And so usually the first thing in the morning is I hear about Mamma. Come look at my poop. So that he can get his gift from the poop fairy. 
So at least you guys have to hear all about that. [Laughter].

**Speaker 2 | 00:30**
Yes. I should follow your by example. And try to teach our foster kittens about that same fairy.

**Speaker 3 | 00:36**
You know, treats would work probably really well.

**Speaker 2 | 00:42**
Yes. Yeah, all right, Tim, good morning Monday. Our star Wesley is back from vacation. 
From well, deserved vacation, I should say. But he probably feels that he needs some transition to the work, so he asked me to lead stand up today.

**Wesley Donaldson | 00:56**
And the economic mind us.

**Speaker 2 | 00:59**
Or maybe he's just to hangover so we couldn't miss that atuate you that's okay, just starting on the lighter side.

**Wesley Donaldson | 01:03**
The hang over.

**Speaker 2 | 01:09**
I showed my screen. You guys should see the chart. 
Sorry, the chart, the Canden board, Mandalor Canden board is usually will be going from right to left, and actually we'll start with the expedite. So we seem to have some expedite tickets currently in progress. Hay.

**Speaker 4 | 01:38**
Yup. So, wait, is this the text message stuff? No, this is the old. Okay, now this. I haven't gotten a chance to look at this yet. Because of the issues we had with SMS and Portal.

**Speaker 2 | 02:01**
Okay, yeah, got it. I got wind on them in the chat based on the states. Okay, of course you guys prioritize that. That's okay. So whenever it's possible to do it, I guess it's the same thing because that's so new. 
But I know we've been focused on the Proity, which is delivering the e commerce store this week. Let's see how we're here. Read from nothing. And I think we currently have advice from states to not mer not deploy anything to production.

**Speaker 4 | 02:36**
Yeah, we should have that resolve soon. Wait on Francis to update the CDK.

**Speaker 5 | 02:44**
Okay. Actually, I mentioned that it's not, it cannot it doesn't block new deployments because the configuration that was updated manly is not managed by s circa K, so it will not be over overwritten. 
So you guys. Okay.

**Speaker 4 | 02:59**
All right, so once this last one, I've got the revert in now and yoviously said your stuff is working. Hey, for the text messages.

**Speaker 6 | 03:07**
Yes.

**Speaker 4 | 03:08**
So leg was already fi. Yeah. So as soon as the. The rever is in, we'll swap legs and then we can ship as usual.

**Speaker 2 | 03:18**
Okay, that sounds good. And you guys feel that will be done like by noon or some point later today.

**Speaker 4 | 03:24**
It's just however long this build takes, the deploy product is happening now.

**Speaker 2 | 03:28**
Okay, so yeah.

**Speaker 4 | 03:29**
That's where we're there.

**Speaker 2 | 03:31**
Yeah, that's great news, thank you very much. Okay in review Jeremy, that's on you join me here. I don't see okay.

**Speaker 7 | 03:46**
These bad storms in Massachusetts right now. So mentioned that he may not have power or internet.

**Speaker 2 | 03:54**
Yeah. Yeah. I read about those. And to admit, we have pretty cold weather cold for us here and usually cold, but nothing like what you're getting. Yeah, understandable. Next to on me that's product displayed 1.1. This component, as we clarified it on Friday, has now been implemented with the New design. The PR is up and I think I picked Dane as well to review if he would like, and I know Michel was reviewing, so thank you very much guys for that. 
If there is any feedback' happy to address. Of course. If not, I'll wait for the other issue to be resolved. And Denmarch, hopefully later this afternoon. With that said, I will be proceeding on one point till next. Let's see here, Dad. 
And since I mentioned if that is exactly the review page, how is that going, please?

**Speaker 8 | 04:53**
Going not so far. I do have a here that's in review. Got some feedback on it and I should, have those tiny tweaks done. It's just we want to. In the meantime, until we figure out how we're going to be handling the membership discount, set that to a default of zero, right, so that we don't give the wrong impression that it is a functioning feature. 
And then it should be good to move on, I believe to the edit card. I'm not sure where it is on this board.

**Speaker 2 | 05:29**
The dated card, it's probably in the TED list still. Okay, so you're good here. Do you need any support or anything less time?

**Speaker 9 | 05:38**
Get no blockers.

**Speaker 2 | 05:40**
Okay, sounds good, thank you very much. You always. I think this is the SMS issue that you just talked about.

**Speaker 6 | 05:50**
Yeah. I just moved that to Don. I spent a Saturday having fun with that. But now is working.

**Speaker 2 | 05:58**
That's a great weekend. You Hetman, thank you very much. We appreciate you. [Laughter] Okay, let's see, Michel, that's still blocked here.

**Wesley Donaldson | 06:10**
I moved that one to paused just because the commerce functionality is more important. I left the comment on the ticket. This is very much an edge case. I'm leaving it in pause for now. I'll circle back around with the team if we need to do any actual updates on this or just adjust our process. The issue underlying issue here is just the speed in which you're pushing against your branch, creating a conflict. 
So this can be solved with process and is lower priority than the commerce work that the team is currently doing.

**Speaker 2 | 06:43**
Okay, that makes sense. And the play where it is blocked because we still don't have the components there, is that correct to obvious? No, it's not.

**Speaker 6 | 06:54**
The playwright. I just assigned those to Stephan, but, we have a bunch of pw test and I want step one or whatever, whoever is gonna work on that to take a look and see if those te if those tickets made a lot of sense. 
Otherwise we can twitter to try to test what is like actually testable right now.

**Speaker 2 | 07:25**
Okay, sorry, which tick were.

**Speaker 10 | 07:28**
You.

**Speaker 6 | 07:28**
Preparing to peel? This? Yeah, the pla white ones you can refresh earlier and you would see, the t okay, those ones, yeah, okay, 55557550. For example, the participant info validation and card form. Jeremy, I think, is working on those ones. 
And that those may not be ready with the validation. I should be ready soon. Arnold.

**Speaker 9 | 07:57**
He's got a PR from st. Okay.

**Speaker 2 | 08:04**
Okay, thank you. Clarifying that.

**Speaker 6 | 08:06**
But I just wanted to add that as a QA you know, what are the main warflows and what are the cases that you may want to test manually every time? Those are the ones that you may want to automa as well. Sure. 
So if you need a ticket, we can create one for you. No problem. Probably not.

**Wesley Donaldson | 08:28**
Sorry guys, let's circle back around on just our tack approach.

**Speaker 10 | 08:29**
But.

**Wesley Donaldson | 08:32**
Or playwright generally, but we can pause playwright conversation for now.

**Speaker 6 | 08:39**
Thank you.

**Speaker 10 | 08:40**
Michel. Hi everyone. I wrapped up the implementation part for this one and I want to test it on the PR environment, but it looks like the Google Maps config is wrong for the PR environment. So basically the maps are unloading and I can't use the search bar for the address to basically test the debug view for the card. 
So I think we need to resolve that. I'm basically free to pick up a new task from the product display Epic to support anyone who needs help, so feel free to sign anything to me. I can start working on that because I'm blocked on the testing part. 
I mean, in the end we can just revue code since that's a debug view and the changes are not user facing. If the code looks good, we can merge it to dev and test on dev. But I think it would be reasonable to configure the maps for PR environments properly. I guess it must be a one card or something for the cloud. SL URLS Michel.

**Speaker 2 | 09:38**
I was able to run the maps Google Maps from PR for quite some time now. Unless something has changed we can double check on that after stand up if you would like. Sure sounds good, thank you.

**Speaker 10 | 09:50**
Thank you.

**Speaker 2 | 09:50**
Yeah I think I haven't heard from Lance. Lance, how are you doing? Good morning.

**Speaker 9 | 09:57**
Yeah. Probablyay. I started looking as more of a research into the recurring submissions and some of the logic around that. I don't have a ticket for it, but I'm going to do it with Dane and kind of pair with some pair that I have in the branch for submitting and trying to kind of align with what we expect to be submitted from the client just so we can tie it into what the business is going to need submitted to AC currently.

**Speaker 2 | 10:28**
Okay. So is that like a spike?

**Speaker 3 | 10:33**
Yeah, I would. It's like a spike. I have a. Lance, maybe you can just log against the epic. I have an epic for it, and I can send it over if you want to create, like a sub task underneath it.

**Wesley Donaldson | 10:55**
Lance, sorry, could you confirm for the product information that has the new UIs from Miro? Right. And so you have those completed.

**Speaker 9 | 11:06**
Yeah. The ones I completed were not design related. So the discussion was to disclose those out as they were. And then the remaining work on those pages. Jeff goes pick it up.

**Speaker 2 | 11:18**
Wait on the packages, is that what you're referring to? Glance okay, just to clarify, because I tried to clarify that on Friday and maybe you elaborate enough. Let's try to do it again. So initially I was working on the diagnostics, which was a separate page. Nowadays this is part of the review page and I already switched it to a new to the New design. 
That's what I did Thursday, Friday and a little bit over the weekend. The PR up packages was wrongly assigned to me by Jennifer and we clarified that on Friday, so now maybe we need to clarify again. 
And that's in the chart. Jennifer who should be working on the packages to get them to the design. My opinion would be that's who created them initially because they have the domain knowledge there. But looking for advice here? Jennifer.

**Speaker 7 | 12:18**
Yeah. If you're looking to me for advice. Let's see who has this bandwidth to pick it up.

**Wesley Donaldson | 12:27**
Okay. Team, we have a we have the meeting this afternoon that we normally use for engineering refinement. We're going to be connecting with product at in about an hour. 
So. So we don't need to use that engineering refinement for Beth and team to share with us upcoming work. So my proposal here is let's use the two PM to get to clarity between the Endor team and the Mandalor team on specifically where we are with things. Who's on first and then who's taking up what specifically concerned around the design who is kind of what we're just talking about but just the rest of the checkout flow after the work that Data is working on. 
So let's. Let's pause those conversations for the. The meeting this afternoon. Currently on your calendar as Engineering Refinement.

**Speaker 2 | 13:09**
Okay, that makes sense. Sounds good, thank you. And finally, I haven't heard from Antonio. Antonio, good morning.

**Speaker 6 | 13:18**
Hey guys.

**Speaker 11 | 13:18**
Good morning. So I working on this issue with the Google Maps API key and then s redirection. So and in parallel, I drafted in a plan to tackle the reconciliation of those expired SQS message that we had on Friday. That makes sense.

**Speaker 2 | 13:43**
Okay, do you need any support, any blockers?

**Speaker 11 | 13:46**
No, nothing specifically you couldn't hear.

**Speaker 2 | 13:49**
Okay. Thank you. That was the board and the team members. Anybody has anything else, any parking lot items?

**Wesley Donaldson | 13:59**
Just one quick note for the team.

**Speaker 2 | 14:00**
Okay.

**Wesley Donaldson | 14:01**
Jeremy Ealvis. You can please join the Product X App Dev discussion in about an hour. I forwarded this week's today's event to you. If you could please plan on joining that session.

**Speaker 2 | 14:14**
She is not on the call.

**Wesley Donaldson | 14:16**
Crap. You're right. 
I'll message him. Hopefully as power in that time.

**Speaker 2 | 14:21**
Sounds good. Thank you Tim, have a great rest of your day.

**Speaker 10 | 14:27**
Have a nice day. Taxiator bye.

