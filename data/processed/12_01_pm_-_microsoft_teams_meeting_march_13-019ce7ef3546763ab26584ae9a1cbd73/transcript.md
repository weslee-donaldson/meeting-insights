# 12:01 PM - Microsoft Teams meeting March 13 - Mar, 13

# Transcript
**Jennifer | 00:02**
Hello?

**Wesley Donaldson | 00:02**
7. [Laughter] Don't have a formal list the way I would like, but we have a few items that look like they're from you.

**Jennifer | 00:05**
Okay, how? Who do we have for a demo today? Wes and Harry. Do you guys have a list?

**Wesley Donaldson | 00:21**
You can share two items. So we have one around the defect that we observed that we received this week around membership not being removed and membership not removing specific diagnostics, and we have another one around the 15-minute appointment bug that we had in MVP.

**Jennifer | 00:42**
Okay, and Harry, what do you have for your team? I'll come back to that. What do you guys want to get started?

**Wesley Donaldson | 00:58**
Yes.

**harry.dennen@llsa.com | 00:58**
I was muted. Yeah. It's the portal fix and the EP fix, and then I can show some streams of the new streams we have. Awesome, thanks.

**Wesley Donaldson | 01:12**
If you want... Can you go first? Harry, I think I have a couple more things I'd like to show. Screening for the engineers to confirm.

**harry.dennen@llsa.com | 01:21**
Okay, Firman, you're good to go, and you want me to...?

**Speaker 4 | 01:25**
Hello, yeah. I can show... So, screen sharing my screen there you go. So, the bug that we have or was fixed is that whenever there's a... Specifically for heart risk assessment, the report, the detailed report if the person has a moderate risk, it shows this table for the heart risk assessment.
So this wasn't being replaced by the actual percentage. So did the fax have PR up? I'll show you first the front end for the AP. I have created an account with the medium risk. So I think this is the one.
Okay, view details.
So here you go. So heart risk assessment with the moderate risk. Now it shows 16% the actual percentage that it computed.
Then yeah, approximately 62,100. That's for the front. It's happening in the admin portal since I think they're sharing the same generation for the before this file, so I'll just show it here.
New results, a detailed report, and then go down to...
Okay, all right risk assessment. 1020, moderate risk, the same thing. 16. Then that means approximately 16 to 100 people with the level of risk, and that's it.

**Wesley Donaldson | 03:53**
It is.

**Speaker 4 | 04:02**
So any questions or feedback on the verbiage and stuff? Okay, that's it.

**harry.dennen@llsa.com | 04:29**
Give it a quick Miro. I just want to organize my tasks. So one of the things you put screen size. So when it comes to keeping track of what's happening in Cognito, there are two things to keep track of. One is Cognito activity.
So this would be Cognito domain events. We have this stream originally added by Rinor where we see things that are specific to Cognito. So this would be its counseling activity. So if you were to log in to commute and look at the pool, you'd see some off events.
So here we collect those within Thrive so we can see those specifically so we can see password reset requested on the Cognito side. Then when the sign is reported, these are our names, but these are values that we get from Cognito directly. The other stream, which is the account stream, involves events that we specifically care about. These are our domain events with regard to Cognito.
So some things that can happen on creation is obviously creating them. Another one would be seeing them change from email to phone or vice versa because we only support one or the other login time in that process.
So here's an example of the new stream. Previously, all these just went to V2, now they go to the specific participant ID stream. Meaning that now, at any point in the system during an OOps, if we need to generate projection at runtime, we can go from the participant stream, the account stream, and the activity stream, and we can put together a pretty good picture of what's going on with the participant at any given time. It means those three things are going into Aurora.
So if we don't want to use the runtime projection, we can have our read models directly assembling those with a SQL query. So this gives us a better picture of what we're dealing with regard to our participants and their status with Cognito and with us.
And yeah, it contributes to the stability.

**Wesley Donaldson | 06:55**
Yeah, not so... This is what we could see up and so now we can see that our pat and you can see the co acc.

**harry.dennen@llsa.com | 06:58**
We had some other work which is just code changes around stability. So there's not a lot to demo there. But this is the account thing. So this is an example of they just swapped it around.
So they had not yet logged in. They decided, I think we default them to email. They decided they want to use their phone. So now we can see that happen and then we can see the account creation or the password reset, which would be their initial one. Actually, we need to augment this because there should be a phone number there as well.
That's it. This is the original one that was added. It's had a different type. The type is actually in event sourcing, it's like they call it a letter wrapper type.

**Wesley Donaldson | 07:33**
The "a" in the reen first a whole flatter wrapper type generally if you're in a subscription and you see fees, constraints, the poses, and others.

**harry.dennen@llsa.com | 07:42**
It's generally if you're looking at a subscription and you're seeing multiple feed streams, you would want to see the different letter wrapper types of which one they're in. Another side on event stores, but that's it. Thank you... You should show that.

**Wesley Donaldson | 07:59**
Thank s.

**harry.dennen@llsa.com | 08:03**
Yeah. So this is where you see those groups should be the letter wrappers.

**Jennifer | 08:18**
Do we ra up next?

**Wesley Donaldson | 08:18**
You don't have a n the yeah, you ls you can share with your what you have available to share.

**harry.dennen@llsa.com | 08:23**
That's it for our side. I don't know.

**Wesley Donaldson | 08:31**
I don't think we have anything else from the team that has confirmed that they're able to share.

**Yoelvis | 08:45**
Okay, let me show you.
This is like the 15-minute rule I am testing locally because I... In the room to 1 minute from now.

**Wesley Donaldson | 08:48**
I think because our as are so that we have to say our going to be not for [Laughter] to comp [Laughter].

**Yoelvis | 08:55**
The idea is the appointment is going to be locked for 15 minutes, and in case we get to the checkout and we try to complete the pushes, we need to verify if we have more than 15 minutes since the user selected the appointment. We need to verify again if that appointment is still available.
If it's not available, we display a message. So I'm calling this to 1 minute. So it should be unavailable when we go to the checkout page.
Alright... This is still available, let me try. Okay, this is something that is happening. I mentioned in the channel they have called it something else. The hard-coded coupon that we are applying with the membership is invalid again.
It's something we need to see how to improve because I don't want to rely on those hard-coded values that sometimes we disable. I don't know why, but other than that, there should be more than one minute.
So let me try. Now I am searching for the screening. Now we have an error. "Your appointment is no longer available. Pick a new one." It's going to work on mobile as well here. In this case, it's going to scroll to that section. In case it's a mobile, you can pick a new one. I am preserving the location, but running a new search here for the screening so we can have fresh data.

**Wesley Donaldson | 11:07**
Were Brit. So I.

**Yoelvis | 11:11**
Now the user can select a new appointment and move forward. Any questions?

**harry.dennen@llsa.com | 11:20**
Looks great, yeah.

**Yoelvis | 11:22**
Thank you. And the other PU request isla in the PU request should be. This one should be ready for review here. It's the deployment happened. Aerno asked. Deployment were failing because of the elastic network interfaces on AWS but I think that should be working soon.

**Wesley Donaldson | 12:05**
And have seen.

**Yoelvis | 12:14**
Let me try with my... 3P run there locally.
So the other issue we have is with the... That the user could select some individual tests, but those individual tests should not be included if the user selects a membership because the membership is included those... Osteoporosis.
So what we are doing is removing those from the car if the user adds the membership. Where those are removed, I just added a message here and never... A toast, like floating here, saying that we remove the dog from the car.
But the direction I got is we don't need to display that, so it's just removing from the car. It is enough. So that's what I did. We can place the order that was the other ticket.

**Wesley Donaldson | 13:44**
Nice.

**Yoelvis | 13:46**
Wesley, you're going to say something.

**Wesley Donaldson | 13:47**
Nope. No. You're good looking. Good.

**Yoelvis | 13:54**
And something else. I wanted to show you if we have time. It's more the tea. But yeah, Jennifer told me that this is the good meaning for that. It's like I add the code and code is like this tool that is going to generate the types and everything we need from GraphQL so basically when something changes in the GraphQL schema in Supergraph or wherever we can just... We just need to regenerate the type like this.
This is going to pull all the types from the schema and update the values here in the GraphQL folder but that's just one thing. We don't need to create those types by hand. Those are created for us by the diagnostic packages. Everything we need is going to be generated from the inference from the GraphQL endpoint.
Other than that, we can create queries, mutations, and everything we want. For example, I created this mutation. When I create this mutation and I run generate, it's going to generate the type for that mutation.
So as you can see here, this document thing was generated not by me, but by Cogen. So now we don't need to care about generating types for the use query or mutation from Apollo, we can just use the type that we use.
Everything we have here is going to be strongly typed but it's very cool. For the queries, we use this and we pass this to Apollo. Apollo is going to identify everything we need. The data is strongly typed and even the variables.
If we have some input variables, those variables are going to be strongly typed as well. So we don't need to maintain the generic here and pass the values and responses and everything else. Everything is just in this document that was generated by Cogen based on the query that we created.
If we modify the query, we just need to call Cogen again or just call this e-cogen watch if we want to continue changing the query or mutation and that's going to generate the types for us and for a thana, I recommend you use this extension if you are using VS Code or this is probably more... I've been using Core so I'm...
I've been changing now to VS Code because I'm missing some of the features, but if you have this configuration here, I added this Apollo conflict. With this Apollo conflict, any of those Apollo tools are going to identify the EL and mutation, and you can have this nice auto-completion in the queries as well.
So I recommend you install one of the extensions. Probably this one is the one I was using before the Apollo one. You install this extension, and I already configured the DRAPL and the queries, and everything we have configured is going to be... You will have the auto-completion and everything else run here.
For example, okay, I have... I need to install the extension, but here if I install this extension, and I come here to control space, for example, it's going to complete the value, and if something is not correct, it's going to alert you in the editor.
So this is an editor developer experience improvement rather than guessing what to put here, we just need to install that extension, and everything is configured so we can use it. That's pretty much it, guys. Any questions, concerns?

**Stace | 18:30**
That's great. Are we using...? Do we have a workspace default? Anything set up in GitHub to speed people up in being able to configure VS Code?

**Yoelvis | 18:42**
With VS Code, we can add a configuration file here that is going to give the recommendation for the extensions. Is that what you're...? Yeah, we can't quite...

**Stace | 18:54**
You can either export profiles or they have this thing I've used in the past as workspace defaults that you can commit.

**Yoelvis | 19:03**
Yeah, I said...

**Stace | 19:06**
Yeah, it might be if the team thinks it's handy. Sounds handy to me. [Laughter].

**Yoelvis | 19:10**
Then we... I can bet it like yours. [Laughter].

**Jennifer | 19:20**
Right? Thanks, and I appreciate you adding that graph coal stuff. That's really cool to auto-generate.

**Yoelvis | 19:32**
The idea is to maybe adopt that in other projects as well. So we were having a pilot here, but we can extend that to other projects. No one wants to maintain types and things like that. [Laughter].

**Jennifer | 19:47**
No, for sure. Was that all of the demos from everyone?

**Wesley Donaldson | 19:57**
That... Is it for you here?

**Jennifer | 20:01**
He...

**Wesley Donaldson | 20:02**
No, you're not. So you had a few other bugs that could have been shareable, but no, we're good.
That's it for Mandalor.

**Jennifer | 20:11**
Okay, a short demo this week. That's good. Thank you, everyone. Have a great weekend.

**Wesley Donaldson | 20:18**
Have a great weekend, all.

**Stace | 20:19**
Thank you, everyone. Thank you.

