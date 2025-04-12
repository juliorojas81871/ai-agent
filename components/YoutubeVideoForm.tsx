import React from 'react'
import Form from "next/form";

function YoutubeVideoForm() {
  return (
    <div>
        <Form
            action={() => {}}
            className="flex flex-col sm:flex-row gap-2 items-center"
        >
            <input placeholder='Enter your Youtube Url' name="url" type="text" />
        </Form>
    </div>
  )
}

export default YoutubeVideoForm