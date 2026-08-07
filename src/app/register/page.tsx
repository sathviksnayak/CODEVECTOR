"use client"
import { useState } from 'react';
import { useRouter } from "next/navigation";
export default function Register() {
    const router=useRouter();
 const [Form, setForm] = useState({
   name: '',
   email: '',
   password: ''
 });

 const [error, setError] = useState({name:"",email:"",password:""});

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      setForm((prevForm) => ({
        ...prevForm,
        [name]: value
      }));
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setError({name:"",email:"",password:""});
      const response= await fetch('http://localhost:3000/api/register', {
        method: 'POST',
        headers: {  },
        body: JSON.stringify(Form)
      })

        if (response.status === 201) {
          console.log('User registered successfully');
          router.push("/login");
        }else if(response.status === 409){
          console.log('User already exists');
        }else if(response.status === 400){
            const data = await response.json();
            setError(data.error);
        }
        else{
          console.error('Error registering user');
        }
    };

return (
  <div className="flex flex-col items-center justify-center min-h-screen py-2">
    <h1 className="text-2xl font-bold mb-4">Register</h1>

    <form className="w-full max-w-sm" onSubmit={handleSubmit}> 
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">
            Name
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="name"
            name="name"
            type="text"
            placeholder="Name"
            value={Form.name}
            onChange={handleChange}
          />
           {error.name && <p className="text-red-500 text-xs italic mb-4">{error.name}</p>}
        </div>
       
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
            Email
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="email"
            name="email"
            type="email"
            placeholder="Email"
            value={Form.email}
            onChange={handleChange}
          />
          {error.email && <p className="text-red-500 text-xs italic mb-4">{error.email}</p>}
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
            Password
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="password"
            name="password"
            type="password"
            placeholder="Password"
            value={Form.password}
            onChange={handleChange}
          />
          {error.password && <p className="text-red-500 text-xs italic mb-4">{error.password}</p>}
        </div>
        <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline" type="submit">
          Register
        </button>

    </form>



</div>
)
}