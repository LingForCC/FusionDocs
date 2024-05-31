# What
This project is inspired by the idea of [Dynamic Document](https://www.inkandswitch.com/embark/). The goal of this project is to create a note-taking App which can pull in external data based on the content of the note in real time and present the data in the way that meets the user's unique need by leveraging LLM.

The user needs to specify the schema of the data that will be pulled in and the APIs that will be used to pull in the data in `JSON` format at the top of the note. But the schema of the data that will be pulled in doesn't need to be the same as the data schema that will be used in the APIs. LLM matches the data schema that will be pulled in to the data schema on the APIs. This will releases the user from understanding the details of the APIs. In the meantime, LLM also takes care of turning the user intention into proper API calls, which means that the capabilities of App is extensible as long as the API is provided. 


