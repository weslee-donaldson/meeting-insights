# AppDev Leads DSU - Mar, 30

# Transcript
**Wesley Donaldson | 00:26**
Good morning. Not sure if it's just. So. There we go. Good.

**harry.dennen@llsa.com | 00:42**
Good morning. 
I know rays on leave this week.

**Wesley Donaldson | 00:56**
Yeah, I think Beth is going to be in a meeting with Stason leadership.

**harry.dennen@llsa.com | 00:57**
Not sure else.

**Jennifer | 01:07**
Well then that leaves us.

**Wesley Donaldson | 01:10**
My favorite people in this meeting.

**Jennifer | 01:16**
Do you want to get started? This stuff.

**Wesley Donaldson | 01:21**
I can go first, I think, because mine is very prescient. Share okay, I'm going to start with just a state of integration. And that summarized things really well again. 
So overall we're doing really well working just from backwards for backwards to right to left. We have a couple of bugs that we identified on Friday. We went end to end using orders in the PR environment and some orders on the sandbox environment. We were able to push orders from the UI all the way into CTAR. We did identify a few issues, and it really was a bit of a working session for the team. We did identify a few issues that were effectively our bugs that we opened up assigned to team members. Team members are actively working through these bugs. The UI was one area that we experienced a bug. We had a chorus issue in the UI and Tony resolved that over the weekend and pushed it this first thing this morning. 
So those are resolved. And we should be able to have business owners walk through the UI experience if they. So desire. However, that should trigger orders through the system. However, we're still having a bit of work done on the EE com API to finalize orders getting into CTAR so while they can push orders in it, there will there is still a few bugs getting from the e com API into CSTAR. 
However, keeping the good news going, we do have the production and Lance did push the production instance or over the weekend this morning for the Star integration. So that's just going to be what it takes to get from our event store over to our event great over into C Star. 
So that effort is looking good as well. The area that are still we've tested like these areas remain in blue. The connections between the systems remain in blue intentionally because we've tested them in sandbox. We haven't tested them in production yet. We have a meeting this afternoon at I think 01:30 eastern time for us to kind of walk through sandbox one more time and then complete pushing orders in the production environment. 
So that's why these are not turned blue green yet turned green. As yet one issue remains. And Jennifer, I'm not sure if you saw the message from Antonio, but we do need to kind of coordinate a little bit more around the production instance and connecting production API keys needed on the recurring side and connection into our production version of the API gateway. 
So just if you could take a quick look at your team's message. There may be. There should be a conversation. There. Started by Antonio, but.

**Jennifer | 03:59**
What chat? Because I tried to go through everything, and if I saw it, I missed it.

**Wesley Donaldson | 04:05**
I can message you offline with it, but it should have come in about an hour ago. 45 minutes ago.

**Jennifer | 04:10**
Okay, this morning, okay, nope, I'll check that I see it now.

**Wesley Donaldson | 04:16**
So I think for the production instance.

**Jennifer | 04:16**
I put that API key in the secret.

**Wesley Donaldson | 04:23**
Yeah, okay, yeah, I thought it was just first sandbox, but that's my miss.

**Jennifer | 04:24**
That's what I did on Friday.

**Wesley Donaldson | 04:28**
If you could just message back nice.

**Jennifer | 04:29**
I only did it for. Sandbox was already there. I only did it for the production.

**Wesley Donaldson | 04:35**
Okay, so that's and perfect. Just let him know it's good to go then. So that takes care of basically everything from just the system build out perspective. We're still, as I mentioned, confirming some communication. We expect to test those this afternoon. 
So overall, feeling very confident about the end to end for the system. And we'll have that proved out this afternoon again. So let me go jump to the board and talk about some specific items that are relevant to individual features that have been created. 
So we had three outstanding features, I'd say. So we had the tracking, we had chat and then we had around couponing as well. So from the tracking perspective, everything is good to go there. There's a PR in place for it. We expect to have this kind of push to production today. 
So that's going to be implementing tracking for the deaf instances production instance that. Beth, thank you again for your direction on the chat. So that's no blockers there. We're good to go. Expect to have that into production today as well. 
And then the final one that we had was a conversation between you, Elvis and Chifk as to who had what ownership on the coupon manual entry in the coupon membership entry. So both of those are in good standing now. We already have the coupon entry menu. Coupon entry in production. 
And once you all this finished some additional testing, we expect to have the UI ticket as well into production. So that would close out all of the membership and membership discounting tickets there is relative to discounting. There's still, as I mentioned, a little bit of work needed in the configuration. 
So there is still one issue that we identified this morning from Lance. Just like just to finalize specific values being sent over as part of the payload. So we're still working through that, but that's minor. I would say the core functionality here is here. Will we may have some minor tweaks as we see data coming through the system. 
So that's the features themselves. One other big concern that we have is a team's idea of just transparency and transparency into the system. So we have that SRA track that kind of tracks much of our transparency effort. 
So as part of that, we had identified. And thank you, Jennifer, for pairing with us on that. We in AF a decent amount of alerts and concerns that we have in how our notifications, our parked events were being handled. That Epic is still being held mostly by me how so we've pulled in the first ticket of that. We've tried through most of the tickets, so we've reviewed all them, but they're very clear to us. Me how is tackling that first one? 
That's talking about the parked events. As part of that, we'll review that. We'll create the Sr, the RC for you. And expectation is to bring that into architecture to have the conversation there. How feels pretty confident he can get to that SRFC for the architecture meeting tomorrow. 
I think that is like I can go through individual line items here. I think, sorry, one feature I did miss apologies is the cook, the consent cookie. We do have that. That's clear to us. We had one quick question from this morning. Beth, thank you for the alignment there. 
So no blocker here. I spoke with FFCO this morning. We expect to have this in PR and ready to go today as well. Any questions?

**Speaker 4 | 08:01**
Is there anything that we need to overn office hours around any need this? I just want to make sure I'm prioritizing anything that you guys need.

**Wesley Donaldson | 08:13**
No, I think the questions and answers you gave today, especially around to Lance. My original thinking was to have that conversation in product office hours. I'll paying Lance and see if he's good to go. 
If anything, that would be what we'd bring into office hours.

**Speaker 4 | 08:28**
Okay? Got it.

**Wesley Donaldson | 08:34**
That's it for me.

**harry.dennen@llsa.com | 08:50**
Okay, so for the main work, we've got process progress on the individual statuses. We postponed some of that Friday and Monday to deal with the shop ongoing shopify issue and the park even issues. So just the last couple of days, we've got the shop like payload stuff that that's not normalized that uses billing now for everything. 
So I'll start with the customer details. And it'll enrich that with billing. We showed that this morning. All seems to be working. That said, there are users coming through with no phone numbers. We did find in e com there is some reconciliation that's done, but only a first last name and date of birth match. 
If those three match, then it will start looking at emails and phone numbers to match them with an existing person. So effectively, what that means is if we pull a phone number out of Cstar to add it to the shop buy, we're kind of circumventing that first name, last same test.

**Wesley Donaldson | 09:52**
So. That's what I. Re.

**harry.dennen@llsa.com | 09:55**
I'm not really sure how they're getting those phone numbers, but they will get associated with the Shop apply purchase. As for the ordinary logic, right? 
So if it comes in with nothing, it doesn't break anything. Is the short story okay?

**Speaker 4 | 10:10**
A couple of questions on that. When was that pushed? So I can give them a time frame of.

**harry.dennen@llsa.com | 10:17**
This morning at about 08:45.

**Speaker 4 | 10:21**
Perfect. And then the ones already failed. Are you guys able to rerun it without this required piece? Yeah, do you need a yeah, okay.

**harry.dennen@llsa.com | 10:29**
No, so that's what I'm getting at. So we went ahead and reran them for the last.

**Wesley Donaldson | 10:33**
To.

**harry.dennen@llsa.com | 10:34**
Took about 45min to get through what was there? We still have the ones that are, they have issues around order items, but all the other ones around phone numbers that they've gone through, that's fine. We confirmed car yeah we confirmed in cstar that the existing phone numbers again given that first name last name and data birth match it does get consolidated so okay veryive yeah so move along there we still need to. I don't know what the story is with the specific products that have items item issues like line item missing. Are you aware of that one?

**Speaker 4 | 11:17**
Are those are all peto items?

**harry.dennen@llsa.com | 11:20**
I think so, yeah.

**Speaker 4 | 11:23**
And yes, that's an expected failure and they are just going to sit there.

**harry.dennen@llsa.com | 11:27**
Okay, good enough. Yeah, most of this is around individual user shopify that the admin portal tests are now shipped and in, the interval and correct metadata this stuff is in review again. We kind of bumped that out while we were dealing with the shopf stuff and parked events. This is all. This has been updated since last review, so this should all go in today around the this is specific to product specific statuses, right? 
So that we can then use those on the front end, which will feed into the next epic we're working on around showing all of the showing all of your results in pending status no matter what, instead of just sort of not showing them until something's there. We'll be doing refinement on that tomorrow morning. The listener is now Sir Francis thinging. Apparently that's not something we're in control of. 
And then. 
So that yeah, this is the encompassing story for these subtasks. And then we have the front end work to actually then use those new statuses on both sides. And the firm is working on making sure that the seven day hold applies to everything on the parked event side. 
So Friday, when we had the conversation about it, we saw that there were lots and lots of those park events and it was questionable valueable value whether or not we wanted to run them. So we said we would. We would try not to run them and just make sure that we knew what was going on. 
So I went ahead and added a parked events database in Athena that can read all the S3 buckets, and then added tables for each of those parked event directories. So now we can query all those things in the history buckets and get some actual data, which I have. 
So we have full counts as of Friday, what was in there and then the last event date. So all these ones that say March fourth. This would be resulting from that increased logging issue we had with the recursive loop producing a bunch of stuff. 
So I guess it' fairly safe to say that nothing useful has come from these yet. So we can probably drop those. We do have ongoing errors showing up in three of the others though. The interval 1 is the first name missing issue the e mail collisions. I'm actually not sure what this is used for. This isn't in the normal path of cognito or anything. This is something else. 
I think it's writing something to Athena. I'm not entirely sure. If anybody has contacts, please let me know. And then the Cognitta sync is from what the samples we saw, it's update attributes failed, but then when we check, the user is there and the attribute is updated. 
So it could be a latency thing. This one's worth looking into. I think the ultimate goal now is to make sure that these product events are actual signal and not just a pile of noise. Put progress on that. 
And then as far as the login error scenarios that we saw, which were looking like a spike, vast majority appeared to be malformed input meaning things that just would never work. We saw dot com, and various other like phone numbers that don't have AA codes and things like that. 
So the most immediate fix is this one. Dan's got a break fix that I'll ship today just to add a little bit more enforcement on that so that'll reduce it. The other scenarios. I think this is going to be something we have brief chat about Friday. This will be something that product should chat about around maybe language or sign up flow because there's obviously a bit of confusion with people coming in trying to log in because it says if you're new but then they've signed up, you know, years ago, they don't think they're new and things like that. 
And then the last, the final one that Dan found, the one legitimate one, is where we had the rollout in December, where we had multiple where you could verify phone. We're still looking at using phone and email. 
So there's a couple of cases like that, which we deal with case by case, but they should be very small at this point.

**Wesley Donaldson | 15:43**
What?

**harry.dennen@llsa.com | 15:46**
It's tough to find one. And that's where we're at.

**Jennifer | 15:58**
Okay, does Michl know about the Athena tables that you guys set up? Because I know he was going to be looking into the noncognito parked events.

**harry.dennen@llsa.com | 16:11**
No, but I can shoot a message. I didn't know he was still working on that. I thought they were just doing the ones the whichever one that released. I think it was the results PDF that he drained. But yeah, I'll SA message to that now.

**Jennifer | 16:27**
Okay. Yeah. You might want to share with the whole team. Actually, if the thena is set up to look at that, that's really helpful.

**Wesley Donaldson | 16:37**
Yes, Harry, just so you're aware. Like our goal is to affect it. Like it's not the ticket he's actively working on. But our goal is to go through all of the park events and for each one, be able to kind of have the conversation of what should be the plan of attack if we see what are the common things that we're seeing for park each park event category, just a comprehensive review of them.

**Jennifer | 16:54**
Two.

**harry.dennen@llsa.com | 16:58**
Well, this will help.

**Wesley Donaldson | 17:00**
Yes.

**Jennifer | 17:06**
Thanks for looking into all the cognito ones that's really helpful. Let us know as you wrap up any of those. Beth, did you have anything for today's meeting?

**Wesley Donaldson | 17:18**
Just stick it to you.

**Jennifer | 17:31**
And she's quiet, so probably not. And then I did hear we are doing something in product office hours, right? Who has stuff for that?

**Wesley Donaldson | 17:43**
I had one perspective item. Lance had about three questions regarding the B, but I think we had that information already from her during standup. I'm just picking with him right now to see if he's clear.

**Jennifer | 17:59**
And then Harri, do we want to do the phone number stuff and talk to that product? Yeah.

**harry.dennen@llsa.com | 18:05**
The log, the new login because there's a the question is like we're enforcing it now, but there isn't direct fees, but feedback like, hey, you didn't looks like you're trying to do an email but you missed it or you put com or something like that, right? It just doesn't enable the button. Feels like a separate story out of scope from this. 
Right now we're just trying to reduce errors, but yeah, Dan will show that.

**Jennifer | 18:27**
The shop of I phone numbers. Do we want to, like, talk through any of that or is that settled?

**harry.dennen@llsa.com | 18:37**
Beth I don't know. We can I think we' there's been a few discussions so far. 
Yeah, I mean, I'll join we'll soon. Okay.

**Jennifer | 18:53**
Sounds good. Okay, thanks. Everyone is in ten minutes.

**Wesley Donaldson | 18:59**
Thank you. Okay. Have. No.

