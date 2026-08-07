import { prisma } from "@/lib/prisma";
import { hash } from "bcryptjs";
function validate(
  name: string,
  email: string,
  password: string
) {
  const errors: {
    name?: string;
    email?: string;
    password?: string;
  } = {};

  if (!name.trim()) {
    errors.name = "Name is required.";
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(email)) {
    errors.email = "A valid email is required.";
  }

  if (password.length < 6) {
    errors.password = "Password must be at least 6 characters long.";
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}
export async function POST(request: Request) {
  const body = await request.json();
  const { name, email, password } = body;

    const validation = validate(name, email, password);
    if(!validation.valid){
      return Response.json({ error: validation.errors }, { status: 400 });
    }

const existingUser = await prisma.user.findFirst({
    where:{
        OR:[
            {email},
            {username:name}
        ]
    }
})
    if(existingUser){
      return Response.json({ error: "User already exists" }, { status: 409 });
    }


    const hashedPassword = await hash(password, 10);
    try{
    const user = await prisma.user.create({
      data: {
        username: name,
        email,
        password: hashedPassword
      }
    });
}catch(error){
    console.log(error)
    return Response.json({ error: "Error creating user" }, { status: 500 });
}

    return Response.json({ message: "User registered successfully" }, { status: 201 });

}