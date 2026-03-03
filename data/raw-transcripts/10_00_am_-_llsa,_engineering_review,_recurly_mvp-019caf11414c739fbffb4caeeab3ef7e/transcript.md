# 10:00 AM - LLSA, Engineering review, Recurly MVP - Mar, 02

# Transcript
**Wesley Donaldson | 00:23**
Good morning, team. Happy Monday. 
Test. Test. 
So. Paying a few folks directly the. 
Right, I think that's qualifies as a quorum. Okay, so let's jump in, just setting the stage. The goal for this meeting is kind of what we did last week. We're looking to review the current state of the currently Commerce implementation and using this session to identify any outstanding like bugs issues things that we need to quickly resolve to get us ready for the demo. Again from last week, our goal was to kind of be feature complete by the end of by the start of day today. 
I know there's currently an issue that we're seeing on the te commerce site, so maybe start there. Does anyone have any insights? Lance, I saw your feet your message. Does anyone have any additional insight as to why that is not currently working? 
And then taking it one step further, how do we want to go through doing the review without that endpoint working?

**lance.fallon@llsa.com | 02:53**
Do weare of a sandbox and a broad url? Another problem. Pride doesn't have the environment VA set.

**Wesley Donaldson | 03:06**
Well. Let's hold on to the sandbox. When? It should work. Actually, hold on. 
Well, that's nice simple solve. Yeah, that's exactly what it sandbox looks good. Let me share that in channel. 
Okay, I can navigate us through if that's preferable for folks. But I think you almost probably you'd be the best person to walk us to just because you have most of the integration. Are you okay with that?

**yoelvis.mulen@llsa.com | 03:56**
But I think the Sandos is not working, the backing is failing, especially on the second step packages.

**Wesley Donaldson | 04:02**
Okay.

**yoelvis.mulen@llsa.com | 04:10**
Con and Jeremy told me today that it's like the deployment is failing because of the I think it's because of the issues we have with the resources.

**Wesley Donaldson | 04:11**
Number a. You and I. Okay.

**yoelvis.mulen@llsa.com | 04:25**
But let me see if I can do it right locally. 
Yeah, locally is failing as well. But let me try with the different. Like.

**lance.fallon@llsa.com | 05:07**
I'm very brab and swapped legs.

**yoelvis.mulen@llsa.com | 05:13**
Yeah, but it is failing with the new thing that we added, the iron code.

**lance.fallon@llsa.com | 05:23**
Yeah, I'm guessing the old like. Well, the old like, definitely didn't have that one, that field.

**yoelvis.mulen@llsa.com | 05:29**
Do you think we should, switch lakes?

**lance.fallon@llsa.com | 05:34**
Yeah, alright, if I want to give it one second, I can query as a grab directly just to double check. That's what it is after even us swap one. We can always swap it back. If we. After. Just dove.

**Wesley Donaldson | 06:14**
Jeremy, can you post that message? I'm sorry. Go ahead. I'll take it. I'll do it, actually.

**lance.fallon@llsa.com | 07:02**
The agraph green has it ind. You have graph and graf. Believe it, not have it.

**yoelvis.mulen@llsa.com | 07:14**
Do you have the url? I forgot the one dev green graph.

**lance.fallon@llsa.com | 07:26**
Right now dev is on the blue slate. If we swap it then it should work.

**yoelvis.mulen@llsa.com | 07:35**
Okay. Let's ruwab it. Can you do it?

**lance.fallon@llsa.com | 09:43**
Okay? It should be. 
Okay.

**yoelvis.mulen@llsa.com | 09:56**
I see that. Packages. That's good. 
Okay, I think, I will have a GPCO sharing because he did the latest changes about packages and review. So maybe you can take the lead.

**Jivko Ivanov | 10:20**
CO I could, but, you know, I think actually we have a better opportunity, let somebody else does it so we can do the testing like a second set of eyes and it's literally just going for the same pages so it's nothing different.

**yoelvis.mulen@llsa.com | 10:40**
Alright? Do you want to do that, Wesley, or you want me to do it?

**Wesley Donaldson | 10:45**
If you're closer to the integration of all of these various disparate features and work efforts.

**Jivko Ivanov | 10:45**
I think you always you've been the deepest into the DAS forever, but yes.

**yoelvis.mulen@llsa.com | 10:56**
Okay, so let's let me know. Okay, here we are in the first step. Let me just keepber a right with the IP code. Because it's more like realistic. 
It's gonna allow the appointment. The screening locations near me near this C code we can modify. Feel this is not looking exactly like the design, but it's good enough. Let me just change to see what happened. 
25mi 10 mi ten locations, 100mi 15 location. I don't like this map. It's like zooming in and out. I didn't know how to fix it quickly, but it's like. 
It's a little annoying, but not a big deal.

**Wesley Donaldson | 12:11**
So. So like we need to call out specific things that we need to address for this week. 
So I'm gonna I'm not going to take that as an item that we need to address. Like when we get the creative.

**yoelvis.mulen@llsa.com | 12:21**
Of course, I'm just talking a lou that. Yeah.

**Wesley Donaldson | 12:24**
No worries. I think we're gonna get, creative review this week. So I'll. I'll let. I'll flag that as a. Hey, what are your thoughts on this? Within that review.

**yoelvis.mulen@llsa.com | 12:35**
Alright, let me use the forward. Okay, the third one is looking good, right? It's like sooner available, but at the nearest location this is it should be working as well for miles 6 mile, 8 mile, 08:12 miles. 
So it's okay, let me just put it in mobile because it's more like what the user are going to experience. So let me select an appointment reserve. So this is an example. So everything is allowed here. No. Some tests not available in my state. What? What happened with Florida? Guys.

**Jivko Ivanov | 13:23**
So we are not now using location based limitation here. So maybe that's a location that some tests are not available in your state.

**Wesley Donaldson | 13:30**
As a power that so rephrase the question how are we how does this implemented like is this just come off data that's coming out of recuurly or is there a hard code we had?

**yoelvis.mulen@llsa.com | 13:34**
Yeah, my understanding. The location based stuff were about California and New York. But I may be one.

**Jivko Ivanov | 13:45**
Okay, I'll double check on.

**Wesley Donaldson | 13:53**
I think this was supposed to be a hard coded list inside a resource file.

**Jivko Ivanov | 13:58**
Yes, a JSON file.

**Wesley Donaldson | 14:02**
Okay, so then if this is matching the JSON file, that is the answer. Like that's not a heading into u VI this but like this shouldn't be just what is the file and is that state inside of that file?

**Jivko Ivanov | 14:12**
I would say we can check it later if we continue. Just take the notes what's wrong right now and we can check it later. Not to run the pulses, so to speak.

**Wesley Donaldson | 14:17**
Three customers.

**yoelvis.mulen@llsa.com | 14:21**
Yeah, no, I just want to make sure I know where is the configuration what is the configuration file?

**Jivko Ivanov | 14:28**
The JSON file can't call the exact folder, but again I would suggest continu and I'll check it later. No. Worse.

**yoelvis.mulen@llsa.com | 14:37**
Alright? No, because we wanted to see if the functionality is working as expected, right?

**Jivko Ivanov | 14:43**
But actually that's a good test. Here we can see the design for the dialog that it's matching. So one more thing to see here.

**yoelvis.mulen@llsa.com | 14:53**
Alright, so here we have the is this okay? I think the idea was to hardcode the assessment.

**Jivko Ivanov | 15:07**
That wasn't how it was showing for me. For me it was showing with the codes and I actually looked into the data that we are receiving from the graph and it seems that both the product codes and the Descriptions are currently the same. That make sure post the response I got. 
So if you look at the chart, the ones that we are getting is diagnostics. Product code and name are the same.

**Wesley Donaldson | 15:39**
Yeah.

**Jivko Ivanov | 15:40**
And I think if we fix the name, then we'll display the correct one.

**Wesley Donaldson | 15:44**
So direction from product last week was that we should just ignore that and just hardcode the values for this MVP so nos to so.

**Jivko Ivanov | 15:55**
Okay. Is there a list of values?

**yoelvis.mulen@llsa.com | 15:56**
There is theres matching the design.

**Jivko Ivanov | 16:02**
All the Vals are already in the design. Yeah.

**yoelvis.mulen@llsa.com | 16:07**
This is a part issue, right? Okay.

**Jivko Ivanov | 16:11**
And that's the diagnostics, that's not the package. Yes, but when you click on the assessments just.

**yoelvis.mulen@llsa.com | 16:25**
Yeah, but I my point is, we want to find we may want to find the information here in packages because it's package page. So this is the value for the assessment for the included one. I don't know if we have the assessment for the rest. Let me shaking the line.

**Jivko Ivanov | 16:47**
To be clear. I have not hard core them. I thought we were relying on the recovery because I saw that the recovery returns both and product code.

**yoelvis.mulen@llsa.com | 16:59**
Alright, that's something we need to do, Wesley. We need to fix this area.

**Wesley Donaldson | 17:04**
We have a ticket for it already. But yeah, I got that one.

**yoelvis.mulen@llsa.com | 17:07**
I think. I think a good idea would be to maybe put this in Adjacson in custom fill just to avoid hardcoding, but yeah.

**Wesley Donaldson | 17:16**
Yeah, I think we proposed that last week, but the direction back from product was they that was not available for us right now. 
So the agreement was for us to hardcode it. But you're right. You're all of this. But not for V. Not for MVP.

**yoelvis.mulen@llsa.com | 17:32**
Okay, so that's like it's a simple change. Just need to make sure we use the right values. 
But I don't see all of them here in the design, I only see the included. But where are the values for the rest of the packages? Same question.

**Wesley Donaldson | 17:53**
Okay, that's the question.

**yoelvis.mulen@llsa.com | 17:54**
This is a simplified view. I see some clean up here, but maybe we clean even the values. 
I think that they were there before. I don't I'm not sure, but okay, but that's something we need to do.

**Wesley Donaldson | 18:06**
So that's for us. 
Like, let me I'll check the epics. I'm not sure if those are called out in the epics. I believe they are. And if they're not? Then I'll just. I'll circle back around with Greg. For us to get those. Pretty sure. Those are.

**yoelvis.mulen@llsa.com | 18:20**
Alright. So I feel like this may be not all right. It's my feeling because in Florida, you knows, kind of liberal state. So I don't think we will have a lot of like restrictions here, but we may have. I don't know.

**Jennifer | 18:45**
If we can look at the list. Do we want to check another state? Because I know Arizona doesn't have any restrictions. And then I know Alabama does have restrictions. Those are off the top of my head. Otherwise, I can look at the requirements.

**yoelvis.mulen@llsa.com | 19:07**
A5I6.

**Jennifer | 19:09**
That's it? Yeah. Gilbert, you guys where I live.

**yoelvis.mulen@llsa.com | 19:20**
Yeah, I think this is kind of okay.

**Jivko Ivanov | 19:22**
I'll double check on that.

**yoelvis.mulen@llsa.com | 19:23**
Yeah, no problem, it's just to try to identify the.

**Jennifer | 19:28**
Do you want to check Alabama to see if it's flipped?

**Jivko Ivanov | 19:35**
I know that I had to display it, for testing purposes because I didn't have this zip codes that you're telling now. So I just it to always display at some point I think that may have not been removed.

**Jennifer | 19:45**
Just will share. I got a list of zip codes to have, for us. Let me get it and I'll share it. Or I'll show.

**yoelvis.mulen@llsa.com | 19:56**
Room for that.

**Jivko Ivanov | 19:57**
Or maybe it's not much because I'm pretty sure I removed it, but yeah, I'll double check on it.

**yoelvis.mulen@llsa.com | 20:03**
One thing I want to test is to see if this is working. You know, the if we if I select this is including like. Okay, I think this is a miscellaneous as well. It says ten assessment for everything, but I don't think this is accurate. 
But it's something we need to fix in that ticket that you mentioned. Wesley, we need to pick this number and put the right list here.

**Wesley Donaldson | 20:30**
Number of assessments.

**lance.fallon@llsa.com | 20:31**
We have a few dollar things that we have to still work out, but I think we're seeing a lot of this is as hard coter right now. Right that like that plus 01:11 a +12 plus zero those are.

**yoelvis.mulen@llsa.com | 20:45**
Yeah, well, that's only it's hard core because I don't I won't expect this to be 1010 and ten.

**lance.fallon@llsa.com | 20:51**
Yeah, and yeah, the way that's

**yoelvis.mulen@llsa.com | 20:56**
Other than that, I just want to test the e review page. If I select this one from Complete Preventive Care. I don't expect to have a lot of a add ons here, but I see all of them is. Is this okay? Are not some of these things.

**lance.fallon@llsa.com | 21:19**
Will disappear if you select the membership package, but not necessarily that addline I think I don't think we have that overlapping in the package.

**yoelvis.mulen@llsa.com | 21:30**
It's not this one included, like a lot of stuff.

**lance.fallon@llsa.com | 21:36**
Yeah, I feel like I checked out on Friday and we didn't actually have anything that overlapped. If you ccked the membership, then I think they disappeared.

**yoelvis.mulen@llsa.com | 21:49**
All right, sick here then. 
So this is the configuration items. No, it's a plan, right?

**lance.fallon@llsa.com | 22:10**
The memberships set item I package is the item packages that.

**yoelvis.mulen@llsa.com | 22:14**
Okay, and this package is the what's the call?

**lance.fallon@llsa.com | 22:20**
I'm not sure because we have different names. I think that's the platinum, maybe.

**yoelvis.mulen@llsa.com | 22:27**
Cortis. Okay, this is a pro catalog and diagnostic products. We have cagnostic dig. Okay, those are the individual, pros and these are the packages. We have four packages coming from Grasriel. I don't know if all of them are going to be here in the Y, but what's the restriction on just are we are you filtering these packages for particular?

**lance.fallon@llsa.com | 23:09**
Yes, so it's in diagnostics, yeah.

**Jivko Ivanov | 23:11**
N yeah. Yeah. On diagnostics. You'll see the packages.

**yoelvis.mulen@llsa.com | 23:18**
You mean, and this one here. Okay, but no, I ask because I see four and here we have three.

**lance.fallon@llsa.com | 23:28**
Now that the packages you're looking at the products on the right.

**yoelvis.mulen@llsa.com | 23:36**
Yeah, packages.

**lance.fallon@llsa.com | 23:38**
One of the packages is the signature, so top one.

**yoelvis.mulen@llsa.com | 23:41**
Yeah, it makes sense. So you say thus we have packages in diagnostics, not in packages.

**Jivko Ivanov | 23:55**
Know there is a feud which tells us which ones to exclude and which one to include.

**yoelvis.mulen@llsa.com | 24:08**
Okay, those are the diagnostics. No, my point is, like, I am not sure if this is accurate, because if I select complete preventive, I wouldn't expect, like, having all the individual tests here. I they are included, right? You can.

**lance.fallon@llsa.com | 24:30**
I don't think any of them are. That's what I'm trying to say.

**yoelvis.mulen@llsa.com | 24:33**
All right. Let me include the membership if you.

**lance.fallon@llsa.com | 24:37**
Because if you click on the ad membership then see the two of them go away.

**yoelvis.mulen@llsa.com | 24:42**
So now we have to only to then let me see what happened. If I select the if I select a package sheer like all of them. And then I come back and I select. Okay, all things are gone right when I come back. 
Alright. So when we click the packages, it's going to clear the selection. The individual test selection. Correct ALR then I'm gonna add this and this review. So here we have the order summary first year three for the first year.

**lance.fallon@llsa.com | 25:37**
And it's hard to right now.

**Jivko Ivanov | 25:39**
Yep, that's what diff told us.

**yoelvis.mulen@llsa.com | 25:44**
Yeah, but this will have a price, right? It's like 100 are or something like that.

**Jennifer | 25:52**
Well, it's just for now. It says free for the first year.

**lance.fallon@llsa.com | 25:58**
It'll be the discount if it applies to their order.

**Jennifer | 26:02**
Because they're doing ramp pricing right?

**lance.fallon@llsa.com | 26:05**
That it that would be the right there would be the discount. So if they got a membership and a blood product, then we would take off $30 from the order or whatever product qualifies for the discount.

**yoelvis.mulen@llsa.com | 26:22**
Yeah. So this one is including cortisol and otooporosis. For that reason, those two were removed into the in the review page. That's okay. And those are the odds, but what about the packages? So you say the packages are not including any of those? 
Alright, let me get to the next page place order. No. What's going on here?

**lance.fallon@llsa.com | 27:01**
May not have the public.

**yoelvis.mulen@llsa.com | 27:04**
Alright, I need to set up this in the e hub and redeploy it, so it's gonna take a while. Maybe I can just test locally. But there is something I need to.

**Jivko Ivanov | 27:21**
I do. I would like to test locally. I deployed my changes to dev so you should be able to hit the graph there and if you fetch the latest main, you have the latest of my changes. We should not have that hard core. It limits dialog there.

**yoelvis.mulen@llsa.com | 27:41**
Alright. I think I gotta run a local house. Is the CA has may just run it. This is a server for the client. So you want me to test with the. Okay, I'm gonna test with the local GRAPHQL or with the remote GRAPHQL.

**Jivko Ivanov | 28:15**
Remote if you would like, but both are fine.

**yoelvis.mulen@llsa.com | 28:18**
Alright, let me try remote to give the syn.

**Jivko Ivanov | 28:24**
In a mode. You could use just a proxy to the different environment.

**yoelvis.mulen@llsa.com | 28:28**
Yeah, I think this is comer def. 
Are we planning to modify this thing here to display like to make it clickable or things like that or this is good for MBP I'm not sure this is what we have in the design I guess so that should be all right enough.

**Wesley Donaldson | 29:20**
Yeah, we can keep track of an advancement enhance mean list, but let's just try to keep it minus that membership, which is now first year only. Let's just try to keep it to what's in the design.

**yoelvis.mulen@llsa.com | 29:31**
Alright, inside the.

**Jivko Ivanov | 29:34**
Go ahead. Just to know that now we didn't get the dialog that for the state for the restrictions.

**yoelvis.mulen@llsa.com | 29:46**
So if you want to get a card DEC client you can use one of these. 
There is NBD GAs when just select this is are completing the other values and complete purchase is gonna tell you where are the errors and then accept the term. Okay now I wanted this read full terms so you can click here and span or collapsed. Following the design with this. 
Alright, let me complete first test is going to graph and it's gonna come back here. This is the error we are getting for recording is related to the payment. So I put that here. The security code you enter don't match? No, not. You can just drive with a different car. 
5. So this is what we have. And if we want to get it through, we can just use one of the card or. Okay, like this one. 
Yeah, maybe I need to alsolean this error after the user change the input here. All right, and we are here. This is something that we need to wire. I don't know if it's Jeremy working on this one, but we are really get the data from the backend about the purchase. 
Maybe we need to send more data. But like the email. Or we can get it from the. You can get.

**lance.fallon@llsa.com | 32:33**
As from the store.

**Wesley Donaldson | 32:39**
Well, we agreed to the store after they completed the order. So would it be better to get it from the query we be very good at for like add it back into response data.

**lance.fallon@llsa.com | 32:53**
And the invoice only sends back like that invoice number and stuff. So we could return some from the graph, but we'd be returning exactly what was sent from the front end. Like for the name and email, I would just use what's in the store. The front end.

**Wesley Donaldson | 33:12**
I think my worry here is just that we're purging the store like we can leave specific values if we're intentional about it, but just generally the idea that we don't want to have the user be able to effectively check out the exact same card again.

**lance.fallon@llsa.com | 33:27**
Yeah, I mean, yeah, we can do it either way if we want to send it on the graph, we can do that And then clear the store after they check out.

**Wesley Donaldson | 33:36**
We come to an agreement now to significant.

**jeremy.campeau@llsa.com | 33:37**
Well, if we use this store, then that would be using the personal info card. If we get it from the graph through re curly, that would be the billing information, I assume. So if that matters more than our decision would have to be based on that.

**yoelvis.mulen@llsa.com | 33:52**
I believe what we need here is the name, email appointment location and disorder number is something I think that we don't have yet. Or we could use the recorded stock.

**jeremy.campeau@llsa.com | 34:14**
And I have a PR up for the calendar thing, so now that the leg switched, I can test that and make sure that to cendar button works. It should. It was, just. I couldn't test end to end because of the legs. 
But as far as the name, do does product want the personal information name and email or do they want the billing information name and email.

**lance.fallon@llsa.com | 34:41**
Or does that said the participant in. So.

**yoelvis.mulen@llsa.com | 34:44**
Yeah, that's a good question. Is this a participant input? What are you saying?

**lance.fallon@llsa.com | 34:49**
That's what Beth had said the other day.

**jeremy.campeau@llsa.com | 34:51**
Yeah, okay, so then I should just use the store then, like what Lance is saying, right? Is that what you're getting atls?

**lance.fallon@llsa.com | 35:02**
Yeah, like we can. We can send it back to the grab. It's just gonna be the same exact thing that was sent in. I the only question would be if we are explicitly clearing the store after they check out. You might not have access to it at this point. That would be the only caveat.

**jeremy.campeau@llsa.com | 35:25**
Okay, so I would just have to make sure that it's not clearing the personal info and then just narrow down the personal information to the name and e mail. So I don't think we're using anything else. 
Right.

**lance.fallon@llsa.com | 35:36**
Or I have the appointment address. Actually, we kind of have a lot there because we have what they bought.

**yoelvis.mulen@llsa.com | 35:51**
Where are we storing the location.

**jeremy.campeau@llsa.com | 35:56**
That's in the I believe that's in one of the slices of the store?

**yoelvis.mulen@llsa.com | 36:00**
No, but in the buckon. Are we storing this in recording?

**lance.fallon@llsa.com | 36:08**
Yeah, if we'd store the appointment, you would.

**yoelvis.mulen@llsa.com | 36:13**
But as a we have a problem we need to know where is the user going.

**lance.fallon@llsa.com | 36:21**
That's a good point.

**Jennifer | 36:23**
I don't think we can clear out the store. Then when we check out, is there any way we can, like, change the state of that information to, like, the most recent checkout or something?

**yoelvis.mulen@llsa.com | 36:38**
I don't think it's about the store because it doesn't matter if we have the information in the store, we need to have the information, you know, we need to know where is the user going. We don't want to just charge the user. We need to know, okay? The user is going to this appointment in this location. 
And this time that data is something we need to control, not that browsers are not recorded properly. It's something we need to control to make sure we got it. I don't know if we are sending this to Sister or whatever.

**Jennifer | 37:14**
So that's all controlled by the guid that he's talking about. The appointment cell GUID that's just the ID of the appointment. The reason that I would be hesitant of storing like too much in recuurly is what if they reschedule it, reach out to the users, like do something like we would need some management of it to update it in recurrly. I do know that they like to have the original appointment date and time at least, just to help out with any of their initial reporting. 
But we shouldn't, like, keep the location and all of that because technically, it could change.

**yoelvis.mulen@llsa.com | 38:01**
Yeah, my understanding. We need to move. We need to create a system for the appointments and orders that is not recurring. But before we get into that, I was trying to think we can have a some a quick solution that we can start using now before we create our system around recording.

**jeremy.campeau@llsa.com | 38:25**
Well, I'm wondering for now if it's just worth it to store in the local store and not worry about it too much, because do we know how often people even are making new appointments on the same device? 
Like is that even a common thing we'd have to worry about?

**yoelvis.mulen@llsa.com | 38:41**
Yeah.

**Jennifer | 38:42**
But it is a very common thing. But we can always restart. Well, one thing is we are going to be adding other people soon, so hopefully that. CON like hopefully that like commonness goes down when we start to allow multiple people on one order, but when we go back to the zip code anyways, we clear the store. 
So we should just do that. Like we can keep it on this page. And then when we go back to entering the zip code, clear it.

**Stace | 39:17**
Well, why would you are sing in this session on this thank you page?

**yoelvis.mulen@llsa.com | 39:22**
Yeah, exactly. When we get to this page, we can just clear. But my point is not about the local storage, it's about the order. Where are we.

**Stace | 39:33**
In that order? Fine for now, right? Because the system will work as it does today until we migrated out of CSTAR. So all those stories will be coming. But now the legacy system will handle it how it does today, once we import the screening into C STAR and FSA.

**yoelvis.mulen@llsa.com | 40:00**
And when are we doing that? I mean, after the user creates the appointment or the subscription, everything, and we say, okay, you are going to this location at this time. Where are we storing that? We have an app stored.

**Stace | 40:16**
With the order, right? You're submitting it as a custom field, as part of the as. When we ingest the order, the system will know what the appointment was.

**Jennifer | 40:25**
And you're storing the ID of it? Yeah, just to be clear, just the ID and that ID has all of its information in CSTAR, which is right now how the system works. And we will be iter on that to update it later.

**yoelvis.mulen@llsa.com | 40:43**
Okay, but when are we storing that? Is my question because we are creating the precurli but I don't is in the custom field is what you're what you say.

**Stace | 40:57**
Yeah.

**lance.fallon@llsa.com | 40:58**
Yeah, I mean wea it's right now it is not saving in C star. All we do is send it to it for it. But we have the appointment gud as a custom field so that we can save it down the line. That's how it would know the address. 
And all that stuff.

**yoelvis.mulen@llsa.com | 41:17**
Where can I find out? Here need to.

**lance.fallon@llsa.com | 41:18**
Display it on that checkout page and there are a few different ways we can do that.

**yoelvis.mulen@llsa.com | 41:25**
But where can we find that here lens.

**lance.fallon@llsa.com | 41:32**
The address or the appointment?

**yoelvis.mulen@llsa.com | 41:35**
The appointment.

**lance.fallon@llsa.com | 41:37**
You would have to use the API.

**yoelvis.mulen@llsa.com | 41:40**
But we cannot see it in the. In the UI.

**Stace | 41:44**
Depends on how you define the custom field when you created it. Yeah, you can in the UI and some are. It depends on what? You're your choice. When you create the custom fiel you go.

**lance.fallon@llsa.com | 41:57**
I mean, you can see the appointment line item and we have custom fields, but the UI is not going to display the custom field for appointment sell good. As far as. All right.

**Stace | 42:13**
I think we've met the requirements as defined up until now. This might be an area we have to revisit. I'm thinking if we currently is going to send the confirmation email for the purchase, that already might be a problem if there's a human readable strain.

**Jennifer | 42:31**
But that's a good point.

**Stace | 42:34**
Yeah, I think we're good for where we're at the moment. So I don't think there's a bug per the requirements you've been given so far, but I wouldn't be surprised if we have to have a appointment story come through the pipeline.

**Jennifer | 42:49**
I'll catch up with Beth on that to tell her that we should add that in. But like any we need to add in. And a story for the information to display on the receipt is.

**Wesley Donaldson | 43:01**
The short term for MVP divi is from the session.

**lance.fallon@llsa.com | 43:02**
Sarah Curley is going to be sending that confirmation email.

**Jennifer | 43:06**
Riculy will be sending the confirmation e mail.

**Stace | 43:11**
Okay, at least it'll send the.

**lance.fallon@llsa.com | 43:14**
I don't know.

**Stace | 43:15**
That's why I said let's hold on it. There might be a different product thing, right? Because Iterable will kick in and do other things, like you're onboarding e mail, all that kind of stuff. So.

**lance.fallon@llsa.com | 43:26**
Yeah, I was going to. And there are others going to happen here.

**Stace | 43:28**
So how do you know if that decision of where we're calling out the appointment is going to be at? So let's I'd like he good at the moment for.

**lance.fallon@llsa.com | 43:37**
In state we would have the handler. It would ultimately submit the C star and it would go through the same flow as another any other order and they will get whatever confirmation email lose out today. The concern with it coming out of recuur is it would have no information on things like the address of the appointment and stuff like that. All we're passing it is a gua that we know about but currently doesn't know about.

**Jennifer | 44:11**
We probably do in this. I'll check with Beth. Want to pass the date time because that was something that we had to add for Shopify just for the ease of consolidating the reports between CTAR and her early. For anybody that's manually like checking things. It was nice to have the original appointment date and time.

**yoelvis.mulen@llsa.com | 44:42**
I don't understand the custom FAL thing, but maybe we can chat about that later because I don't see it in the account or anywhere. It's like something we need to find here. Or you say infurations.

**lance.fallon@llsa.com | 45:00**
But I couldn't show you how it's working. All right?

**Stace | 45:08**
Yeah, I mean, the simple solution might sound like, again, I think we're fine at the moment. We could always change that custom field into like JSON to right that has the appointment go it as well as a string. 
And then you could echo that string. You could re render that string back wherever we need to. AL right.

**Wesley Donaldson | 45:34**
Sorry, let's just like, what's the final decision on how to support rendering that page? Great conversation. 
But like, we're pulling it from local storage to the final decision. Just for the sake of MVP.

**Stace | 45:45**
Yeah. Pull it from local storage. Render the page once the render is complete and you can clear local storage.

**Wesley Donaldson | 45:51**
Exactly right.

**yoelvis.mulen@llsa.com | 45:59**
Is the order number. Are we put in an order number? Just nothing for now. But this is where we get from the backgend right now. Invie number and section ID. 
Are we explaining something here or you are not sure?

**lance.fallon@llsa.com | 46:37**
I have no idea. The only ID we have is the invoice number, and that's sort of non readable. Charge invoice ID you won't have the order be ready at this point.

**yoelvis.mulen@llsa.com | 46:52**
Okay, so maybe we can just remove this again, or.

**Wesley Donaldson | 46:57**
No, display the invoice number and then let's create a ticket for solving what this needs to be.

**yoelvis.mulen@llsa.com | 46:57**
Yeah. Me?

**Wesley Donaldson | 47:02**
What the actual number needs to be. We need a unique identifier to show that when a person places an order for the sake of MVP, we need a unique identifier to show that it's a new order and that this is dynamically rendered.

**yoelvis.mulen@llsa.com | 47:17**
Yeah. I would assume this is gonna be your order number in our system in the future, but yeah, alright.

**lance.fallon@llsa.com | 47:25**
I don't think that.

**Jennifer | 47:27**
I got word back from Beth on the receipt. Right now, the receipt is just a confirmation of the order being placed, so they're not putting any information like the appointment stuff on it since that's coming from CSTAR Ederbil.

**yoelvis.mulen@llsa.com | 47:50**
So I just want to connect the dots. When are we sending to. Sister the appointment information are we doing that with the website?

**Stace | 48:01**
It's as those stories later today or Jennifer it's all common.

**Jennifer | 48:10**
Wess, you and I need to come together on when like we're going to be done with those. So. I didn't get much time on Friday.

**Wesley Donaldson | 48:16**
Yeah, that the plan is. My plan right now is like I'm. I'm bringing that to your Elvis Antonio this afternoon for a working session. I'm scaffolding out what I think it should be, but I just need. I need the three of us to kind of. 
And you can join as well. The three of us to start building that out before we can have something in process for review.

**Jennifer | 48:36**
Okay. Perfect.

**yoelvis.mulen@llsa.com | 48:38**
Could you at least.

**Stace | 48:38**
Have the option for that meeting too, please?

**lance.fallon@llsa.com | 48:42**
Then yells this page is showing before it goes into CSTAR. So yeah, at this point. Tech.

**Stace | 48:49**
Yeah, and you'll love this. This is what we talked about in an architecture session, if that helps. Rings the bell. TE is that.

**yoelvis.mulen@llsa.com | 48:57**
Yeah. But the thing is, when you get the web hook, you within that web hook, we need to query recordly and then get the information from recording or any other system. And are we able to get this information from record? Lens?

**lance.fallon@llsa.com | 49:16**
Yeah. We don't need it. From Curley, we have the appointment. Good.

**yoelvis.mulen@llsa.com | 49:21**
Yeah, so.

**Stace | 49:21**
But part of the order, right? Because it's already saved with the custom field.

**lance.fallon@llsa.com | 49:28**
The appointment Gode gives us the screening, the order, the address, all that stuff. We can tie all that out in our system if we have an appointment to this.

**yoelvis.mulen@llsa.com | 49:40**
Alright, so appointment good is a custom fill within the order and recording, but okay, that's good. Perfect. Anything else you want to discuss? 
All right, that's.

**Wesley Donaldson | 50:15**
Is anyone, aware of any tickets they're currently working on that impacts the flow that are outstanding. I'll. Excluding the ones that we've just agreed to, is there anything else you're aware that's outstanding? 
Okay, all right, so I'll write up the ones that we have here. I'll create another epic for it, and, I'll start assigning up tickets relative to those items, most likely after status. 
So this afternoon. So apologies if this is something you've heard that you knows a task for you. If I could ask you to be proactive and just take that on without before without waiting for a task. But I will get the task in the board for transparency's sake. We just have a couple meetings that are lined up, and I don't want to have folks just waiting for a ticket when they know what their tasks are. 
All right. Thank you guys so much. It's coming along. Great work. A lot of refinement still, but it's like good progress. Let's connect in status. And then we' we'll keep. We'll keep attacking it. Your job. Team.

**jeremy.campeau@llsa.com | 51:24**
Thanks, everyone. Have a.

**yoelvis.mulen@llsa.com | 51:25**
Good one. Thank you.

**Wesley Donaldson | 51:27**
All.

